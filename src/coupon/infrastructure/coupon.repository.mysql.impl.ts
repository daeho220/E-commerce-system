import { ICouponRepository } from '../domain/coupon.repository.interface';
import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { getClient } from '../../common/util';
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CouponStatus } from '../domain/type/couponStatus.enum';
import { LoggerUtil } from '../../common/utils/logger.util';
@Injectable()
export class CouponRepository implements ICouponRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        try {
            const client = getClient(this.prisma, tx);
            const coupon = await client.$queryRaw<PrismaUserCoupon[]>`  
                SELECT * FROM user_coupon WHERE user_id = ${userId} AND coupon_id = ${couponId} FOR UPDATE
            `;

            if (coupon.length === 0) {
                throw new NotFoundException(
                    `ID가 ${userId}인 사용자와 ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`,
                );
            }

            return coupon[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('사용자 쿠폰 조회 오류', error, { userId, couponId });
            throw new InternalServerErrorException(`사용자 쿠폰 조회 중 오류가 발생했습니다.`);
        }
    }

    async findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        try {
            const client = getClient(this.prisma, tx);
            const userCoupon = await client.user_coupon.findFirst({
                where: { user_id: userId, coupon_id: couponId },
            });

            if (!userCoupon) {
                return null;
            }

            return userCoupon;
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 조회 오류', error, { userId, couponId });
            throw new InternalServerErrorException(`사용자 쿠폰 조회 중 오류가 발생했습니다.`);
        }
    }

    async findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        try {
            const client = getClient(this.prisma, tx);
            const coupon = await client.$queryRaw<PrismaCoupon[]>`
                SELECT * FROM coupon WHERE id = ${couponId} FOR UPDATE
            `;

            if (coupon.length === 0) {
                throw new NotFoundException(`ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`);
            }

            return coupon[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('쿠폰 조회 오류', error, { couponId });
            throw new InternalServerErrorException(`쿠폰 조회 중 오류가 발생했습니다.`);
        }
    }

    async updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        const client = getClient(this.prisma, tx);
        try {
            const userCoupon = await client.user_coupon.update({
                where: { id: userCouponId },
                data: { status },
            });

            if (!userCoupon) {
                throw new NotFoundException(
                    `ID가 ${userCouponId}인 사용자 쿠폰을 찾을 수 없습니다.`,
                );
            }

            return userCoupon;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('사용자 쿠폰 상태 업데이트 오류', error, { userCouponId, status });
            throw new InternalServerErrorException(
                `사용자 쿠폰 상태 업데이트 중 오류가 발생했습니다.`,
            );
        }
    }

    async findCouponListByUserId(userId: number): Promise<PrismaCoupon[]> {
        try {
            const client = getClient(this.prisma);
            const coupon = await client.coupon.findMany({
                where: {
                    user_coupon: {
                        some: {
                            user_id: userId,
                        },
                    },
                },
            });

            if (coupon.length === 0) {
                return [];
            }

            return coupon;
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 목록 조회 오류', error, { userId });
            throw new InternalServerErrorException(`사용자 쿠폰 목록 조회 중 오류가 발생했습니다.`);
        }
    }

    async createUserCoupon(
        userId: number,
        couponId: number,
        expirationDate: Date,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        try {
            const client = getClient(this.prisma, tx);
            const userCoupon = await client.user_coupon.create({
                data: {
                    user_id: userId,
                    coupon_id: couponId,
                    status: CouponStatus.AVAILABLE,
                    issue_date: new Date(),
                    expiration_date: expirationDate,
                },
            });

            return userCoupon;
        } catch (error) {
            LoggerUtil.error('사용자 쿠폰 생성 오류', error, { userId, couponId, expirationDate });
            throw new InternalServerErrorException(`사용자 쿠폰 생성 중 오류가 발생했습니다.`);
        }
    }

    async increaseCouponCurrentCount(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        try {
            const client = getClient(this.prisma, tx);
            const coupon = await client.coupon.update({
                where: { id: couponId },
                data: { current_count: { increment: 1 } },
            });
            if (!coupon) {
                throw new NotFoundException(`ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('쿠폰 현재 발급 카운트 증가 오류', error, { couponId });
            throw new InternalServerErrorException(
                `쿠폰 현재 발급 카운트 증가 중 오류가 발생했습니다.`,
            );
        }
    }
}
