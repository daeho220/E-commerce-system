import { Inject, Injectable } from '@nestjs/common';
import { ICouponRepository, ICOUPON_REPOSITORY } from '../coupon.repository.interface';
import { user_coupon as PrismaUserCoupon, coupon as PrismaCoupon } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { CouponStatus } from '../type/couponStatus.enum';
import { CouponDiscountType } from '../type/couponDiscount.enum';
import { CalculateAllPriceDto } from './dto/calculateAllPrice.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class CouponService {
    constructor(
        @Inject(ICOUPON_REPOSITORY)
        private readonly couponRepository: ICouponRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    // 사용자 쿠폰 조회
    async findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validateCouponId(couponId);
        return this.couponRepository.findUserCouponByUserIdAndCouponIdwithLock(
            userId,
            couponId,
            tx,
        );
    }

    // 쿠폰 조회
    async findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        this.commonValidator.validateCouponId(couponId);
        return this.couponRepository.findCouponByIdwithLock(couponId, tx);
    }

    // 사용자 쿠폰 상태 업데이트
    async updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        this.commonValidator.validateUserCouponId(userCouponId);
        this.commonValidator.validateCouponStatus(status);
        return this.couponRepository.updateUserCouponStatus(userCouponId, status, tx);
    }

    // 사용자 쿠폰 상태 검증
    async validateCoupon(userCoupon: PrismaUserCoupon): Promise<void> {
        if (userCoupon.status !== CouponStatus.AVAILABLE) {
            throw new Error('사용할 수 없는 쿠폰입니다.');
        }

        if (userCoupon.expiration_date < new Date()) {
            throw new Error('만료된 쿠폰입니다.');
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
        return this.couponRepository.findCouponListByUserId(userId);
    }
}
