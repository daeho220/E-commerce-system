import { BadRequestException } from '@nestjs/common';
import { CouponStatus } from '../coupon/domain/coupon-status.enum';

export class CommonValidator {
    validateCouponId(couponId: number): void {
        if (!Number.isInteger(couponId) || couponId <= 0) {
            throw new BadRequestException('유효하지 않은 쿠폰 ID입니다.');
        }
    }

    validateUserId(userId: number): void {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestException('유효하지 않은 사용자 ID입니다.');
        }
    }

    validateUserCouponId(userCouponId: number): void {
        if (!Number.isInteger(userCouponId) || userCouponId <= 0) {
            throw new BadRequestException('유효하지 않은 사용자 쿠폰 ID입니다.');
        }
    }

    validateProductId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('유효하지 않은 상품 ID입니다.');
        }
    }

    validateCouponStatus(status: string): void {
        const validStatuses = Object.values(CouponStatus);
        if (!validStatuses.includes(status as CouponStatus)) {
            throw new BadRequestException('유효하지 않은 쿠폰 상태입니다.');
        }
    }

    validateProductQuantity(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new BadRequestException('유효하지 않은 수량입니다.');
        }
    }
}
