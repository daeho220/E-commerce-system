import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface ICouponRepository {
    findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null>;
    findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null>;
    findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null>;
    findCouponById(couponId: number, tx: Prisma.TransactionClient): Promise<PrismaCoupon | null>;
    updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon>;
    findCouponListByUserId(userId: number): Promise<PrismaCoupon[]>;
    createUserCoupon(
        userId: number,
        couponId: number,
        expirationDate: Date,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon>;
    increaseCouponCurrentCount(couponId: number, tx: Prisma.TransactionClient): Promise<void>;
    findIssuableCouponList(): Promise<PrismaCoupon[]>;
    createUserCoupons(
        userIds: number[],
        coupon: PrismaCoupon,
        tx: Prisma.TransactionClient,
    ): Promise<void>;
}

export const ICOUPON_REPOSITORY = Symbol('ICOUPON_REPOSITORY');
