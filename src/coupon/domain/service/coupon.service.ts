import { Inject, Injectable } from '@nestjs/common';
import { ICouponRepository, ICOUPON_REPOSITORY } from '../coupon.repository.interface';
import { user_coupon as PrismaUserCoupon, coupon as PrismaCoupon } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
@Injectable()
export class CouponService {
    constructor(
        @Inject(ICOUPON_REPOSITORY)
        private readonly couponRepository: ICouponRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    // 사용자 쿠폰 조회
    async findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
    ): Promise<PrismaUserCoupon | null> {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validateCouponId(couponId);
        return this.couponRepository.findUserCouponByUserIdAndCouponId(userId, couponId);
    }

    // 쿠폰 조회
    async findCouponById(couponId: number): Promise<PrismaCoupon | null> {
        this.commonValidator.validateCouponId(couponId);
        return this.couponRepository.findCouponById(couponId);
    }

    // 사용자 쿠폰 상태 업데이트
    async updateUserCouponStatus(userCouponId: number, status: string): Promise<PrismaUserCoupon> {
        this.commonValidator.validateUserCouponId(userCouponId);
        this.commonValidator.validateCouponStatus(status);
        return this.couponRepository.updateUserCouponStatus(userCouponId, status);
    }
}
