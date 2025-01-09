import { ICouponRepository } from '../domain/coupon.repository.interface';
import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { getClient } from '../../common/util';
@Injectable()
export class CouponRepository implements ICouponRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUserCouponByUserIdAndCouponIdwithLock(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        const client = getClient(this.prisma, tx);
        const coupon = await client.$queryRaw<PrismaUserCoupon[]>`  
            SELECT * FROM user_coupon WHERE user_id = ${userId} AND coupon_id = ${couponId} FOR UPDATE
        `;

        if (coupon.length === 0) {
            throw new Error('사용자 쿠폰 정보를 찾을 수 없습니다.');
        }

        return coupon[0];
    }

    async findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        const client = getClient(this.prisma, tx);
        const coupon = await client.$queryRaw<PrismaCoupon[]>`
            SELECT * FROM coupon WHERE id = ${couponId} FOR UPDATE
        `;

        if (coupon.length === 0) {
            throw new Error('쿠폰 정보를 찾을 수 없습니다.');
        }

        return coupon[0];
    }

    async updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        const client = getClient(this.prisma, tx);
        try {
            return await client.user_coupon.update({
                where: { id: userCouponId },
                data: { status },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error('업데이트할 사용자 쿠폰 정보를 찾을 수 없습니다.');
            }
            throw error;
        }
    }
}
