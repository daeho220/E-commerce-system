import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon } from '@prisma/client';

export interface ICouponRepository {
    findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
    ): Promise<PrismaUserCoupon | null>;
    findCouponById(couponId: number): Promise<PrismaCoupon | null>;
    updateUserCouponStatus(userCouponId: number, status: string): Promise<PrismaUserCoupon>;
}

export const ICOUPON_REPOSITORY = Symbol('ICOUPON_REPOSITORY');
