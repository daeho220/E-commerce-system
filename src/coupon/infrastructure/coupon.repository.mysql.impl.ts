import { ICouponRepository } from '../domain/coupon.repository.interface';
import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { getClient } from '../../common/util';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CouponStatus } from '../domain/type/couponStatus.enum';
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

        return coupon[0];
    }

    async findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon | null> {
        const client = getClient(this.prisma, tx);
        const userCoupon = await client.user_coupon.findFirst({
            where: { user_id: userId, coupon_id: couponId },
        });

        return userCoupon;
    }

    async findCouponById(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        const client = getClient(this.prisma, tx);
        const coupon = await client.coupon.findUnique({ where: { id: couponId } });
        return coupon;
    }

    async findCouponByIdwithLock(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaCoupon | null> {
        const client = getClient(this.prisma, tx);
        const coupon = await client.$queryRaw<PrismaCoupon[]>`
                SELECT * FROM coupon WHERE id = ${couponId} FOR UPDATE
            `;

        return coupon[0];
    }

    async updateUserCouponStatus(
        userCouponId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
        const client = getClient(this.prisma, tx);
        const userCoupon = await client.user_coupon.update({
            where: { id: userCouponId },
            data: { status },
        });

        if (!userCoupon) {
            throw new NotFoundException(`ID가 ${userCouponId}인 사용자 쿠폰을 찾을 수 없습니다.`);
        }

        return userCoupon;
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

        return coupon;
    }

    async createUserCoupon(
        userId: number,
        couponId: number,
        expirationDate: Date,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUserCoupon> {
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
    }

    async increaseCouponCurrentCount(
        couponId: number,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        const client = getClient(this.prisma, tx);

        const coupon = await this.findCouponById(couponId, tx);

        // if (coupon.max_count <= coupon.current_count) {
        //     throw new ConflictException(`쿠폰 ID ${couponId}의 재고가 없습니다.`);
        // }

        await client.coupon.update({
            where: { id: couponId },
            data: { current_count: { increment: 1 } },
        });
    }
}
