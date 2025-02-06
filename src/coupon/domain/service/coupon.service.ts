import {
    Inject,
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ICouponRepository, ICOUPON_REPOSITORY } from '../coupon.repository.interface';
import { user_coupon as PrismaUserCoupon, coupon as PrismaCoupon } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { CouponStatus } from '../type/couponStatus.enum';
import { CouponDiscountType } from '../type/couponDiscount.enum';
import { CalculateAllPriceDto } from './dto/calculateAllPrice.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { LoggerUtil } from '../../../common/utils/logger.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LOCK_TTL } from '../../../common/constants/redis.constants';
import { RedisRedlock } from '../../../database/redis/redis.redlock';
import { ExecutionError } from 'redlock';
@Injectable()
export class CouponService {
    constructor(
        @Inject(ICOUPON_REPOSITORY)
        private readonly couponRepository: ICouponRepository,
        private readonly commonValidator: CommonValidator,
        private readonly prisma: PrismaService,
        private readonly redisRedlock: RedisRedlock,
    ) {}

    // 사용자 쿠폰 조회
    async findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validateCouponId(couponId);

        try {
            const userCoupon =
                await this.couponRepository.findUserCouponByUserIdAndCouponIdwithLock(
                    userId,
                    couponId,
                    tx,
                );

            if (!userCoupon) {
                throw new NotFoundException(
                    `사용자 ID ${userId}가 쿠폰 ID ${couponId}을 가지고 있지 않습니다.`,
                );
            }

            return userCoupon;
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 조회 오류', error, { userId, couponId });

            if (
                error instanceof NotFoundException ||
                error instanceof PrismaClientKnownRequestError
            ) {
                throw error;
            }

            throw new InternalServerErrorException(`사용자 쿠폰 조회 중 오류가 발생했습니다.`);
        }
    }

    // 쿠폰 조회
    async findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        this.commonValidator.validateCouponId(couponId);
        try {
            const coupon = await this.couponRepository.findCouponByIdwithLock(couponId, tx);
            if (!coupon) {
                throw new NotFoundException(`ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`);
            }
            return coupon;
        } catch (error) {
            LoggerUtil.error('쿠폰 조회 오류', error, { couponId });

            if (
                error instanceof NotFoundException ||
                error instanceof PrismaClientKnownRequestError
            ) {
                throw error;
            }
            throw new InternalServerErrorException(`쿠폰 조회 중 오류가 발생했습니다.`);
        }
    }

    // 사용자 쿠폰 상태 업데이트
    async updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        this.commonValidator.validateUserCouponId(userCouponId);
        this.commonValidator.validateCouponStatus(status);
        try {
            const userCoupon = await this.couponRepository.updateUserCouponStatus(
                userCouponId,
                status,
                tx,
            );

            if (!userCoupon) {
                throw new NotFoundException(
                    `ID가 ${userCouponId}인 사용자 쿠폰을 찾을 수 없습니다.`,
                );
            }

            return userCoupon;
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 상태 업데이트 오류', error, { userCouponId, status });

            if (
                error instanceof NotFoundException ||
                error instanceof PrismaClientKnownRequestError
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                `사용자 쿠폰 상태 업데이트 중 오류가 발생했습니다.`,
            );
        }
    }

    // 사용자 쿠폰 상태 검증
    async validateCoupon(userCoupon: PrismaUserCoupon): Promise<void> {
        if (userCoupon.status !== CouponStatus.AVAILABLE) {
            throw new BadRequestException('사용할 수 없는 쿠폰입니다.');
        }

        if (userCoupon.expiration_date < new Date()) {
            throw new BadRequestException('만료된 쿠폰입니다.');
        }
    }

    // 할인 가격 계산
    async calculateAllPrice(
        couponInfo: PrismaCoupon,
        originalPrice: number,
    ): Promise<CalculateAllPriceDto> {
        let discountPrice: number;

        if (couponInfo.discount_type === CouponDiscountType.PERCENTAGE) {
            discountPrice = Math.ceil(originalPrice * (couponInfo.discount_amount / 100));
        } else if (couponInfo.discount_type === CouponDiscountType.AMOUNT) {
            discountPrice = couponInfo.discount_amount;
        } else {
            throw new Error('유효하지 않은 쿠폰입니다.');
        }

        discountPrice = Math.min(discountPrice, originalPrice);
        const totalPrice = originalPrice - discountPrice;

        return {
            originalPrice,
            discountPrice,
            totalPrice,
        };
    }

    // 사용자 쿠폰 목록 조회
    async findCouponListByUserId(userId: number): Promise<PrismaCoupon[]> {
        this.commonValidator.validateUserId(userId);
        try {
            return await this.couponRepository.findCouponListByUserId(userId);
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 목록 조회 오류', error, { userId });

            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(`사용자 쿠폰 목록 조회 중 오류가 발생했습니다.`);
        }
    }

    // 사용자 쿠폰 발급 with 분산락
    async createUserCoupon(userId: number, couponId: number): Promise<PrismaUserCoupon> {
        const lockKey = `coupon:${couponId}:issue`;

        try {
            const redlock = await this.redisRedlock.getRedlock();
            const lock = await redlock.acquire([lockKey], LOCK_TTL);

            try {
                return await this.prisma.$transaction(async (tx) => {
                    // 사용자가 이미 해당 쿠폰을 가지고 있는지 검증
                    const userCoupon =
                        await this.couponRepository.findUserCouponByUserIdAndCouponId(
                            userId,
                            couponId,
                            tx,
                        );

                    if (userCoupon) {
                        throw new ConflictException(
                            `사용자 ID ${userId}가 이미 쿠폰 ID ${couponId}을 가지고 있습니다.`,
                        );
                    }

                    // 해당 쿠폰 조회
                    const coupon = await this.couponRepository.findCouponById(couponId, tx);

                    // 쿠폰 조회 실패
                    if (!coupon) {
                        throw new NotFoundException(`ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`);
                    }
                    // 쿠폰 재고 검증
                    if (coupon.current_count >= coupon.max_count) {
                        throw new ConflictException(`쿠폰 ID ${couponId}의 재고가 없습니다.`);
                    }

                    // 쿠폰 발급 가능일 검증
                    const now = new Date();
                    if (now < coupon.issue_start_date || now > coupon.issue_end_date) {
                        throw new ConflictException(
                            `쿠폰 ID ${couponId}의 발급 가능일이 아닙니다.`,
                        );
                    }

                    // 쿠폰 만료일 계산
                    let expirationDate: Date;
                    if (coupon.expiration_type === 'ABSOLUTE') {
                        expirationDate = coupon.absolute_expiration_date;
                    } else if (coupon.expiration_type === 'RELATIVE') {
                        expirationDate = new Date(
                            new Date().getTime() + coupon.expiration_days * 24 * 60 * 60 * 1000,
                        );
                    }

                    // 사용자 쿠폰 생성
                    const issuedUserCoupon = await this.couponRepository.createUserCoupon(
                        userId,
                        couponId,
                        expirationDate,
                        tx,
                    );

                    // 쿠폰 현재 발급 카운트 증가
                    await this.couponRepository.increaseCouponCurrentCount(couponId, tx);

                    return issuedUserCoupon;
                });
            } catch (error) {
                LoggerUtil.error('분산락 쿠폰 발급 오류', error, { userId, couponId });
                if (error instanceof ExecutionError) {
                    throw new ConflictException('쿠폰 발급에 실패했습니다.');
                }
                throw error;
            } finally {
                await lock.release();
            }
        } catch (error) {
            LoggerUtil.error('분산락 쿠폰 발급 오류', error, { userId, couponId });
            throw error;
        }
    }

    // 발급 가능한 쿠폰 목록 조회
    async findIssuableCouponList(): Promise<PrismaCoupon[]> {
        try {
            return await this.couponRepository.findIssuableCouponList();
        } catch (error) {
            LoggerUtil.error('발급 가능한 쿠폰 목록 조회 오류', error, {});
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(
                `발급 가능한 쿠폰 목록 조회 중 오류가 발생했습니다.`,
            );
        }
    }

    // 복수 개의 사용자 쿠폰 생성
    async createUserCoupons(userIds: number[], coupon: PrismaCoupon): Promise<void> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                return await this.couponRepository.createUserCoupons(userIds, coupon, tx);
            });
        } catch (error) {
            LoggerUtil.error('복수 개의 사용자 쿠폰 생성 오류', error, { userIds, coupon });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(
                `복수 개의 사용자 쿠폰 생성 중 오류가 발생했습니다.`,
            );
        }
    }
}
