import { ICouponRepository } from '../domain/coupon.repository.interface';
import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getClient } from '../../common/util';
import { NotFoundException } from '@nestjs/common';
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
            throw new NotFoundException(
                `ID가 ${userId}인 사용자와 ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`,
            );
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
            throw new NotFoundException(`ID가 ${couponId}인 쿠폰을 찾을 수 없습니다.`);
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
            throw new Error(`[사용자 쿠폰 상태 업데이트 오류]: ${error}`);
        }
    }

    async findCouponListByUserId(userId: number): Promise<PrismaCoupon[]> {
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
            throw new NotFoundException(`사용자 ID ${userId}의 쿠폰을 찾을 수 없습니다.`);
        }

        return coupon;
    }
}
