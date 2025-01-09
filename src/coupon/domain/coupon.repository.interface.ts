import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface ICouponRepository {
    findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null>;
    findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null>;
    updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon>;
    findCouponListByUserId(userId: number): Promise<PrismaCoupon[]>;
}

export const ICOUPON_REPOSITORY = Symbol('ICOUPON_REPOSITORY');
