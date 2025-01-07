import { ICouponRepository } from '../domain/coupon.repository.interface';
import { coupon as PrismaCoupon, user_coupon as PrismaUserCoupon } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class CouponRepository implements ICouponRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUserCouponByUserIdAndCouponId(
        userId: number,
        couponId: number,
    ): Promise<PrismaUserCoupon | null> {
        const coupon = await this.prisma.user_coupon.findFirst({
            where: { user_id: userId, coupon_id: couponId },
        });

        if (!coupon) {
            throw new Error('사용자 쿠폰 정보를 찾을 수 없습니다.');
        }

        return coupon;
    }

    async findCouponById(couponId: number): Promise<PrismaCoupon | null> {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id: couponId },
        });

        if (!coupon) {
            throw new Error('쿠폰 정보를 찾을 수 없습니다.');
        }

        return coupon;
    }

    async updateUserCouponStatus(userCouponId: number, status: string): Promise<PrismaUserCoupon> {
        try {
            return await this.prisma.user_coupon.update({
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
