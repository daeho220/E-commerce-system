import { order as PrismaOrder } from '@prisma/client';

export class OrderValidator {
    static validate(order: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>) {
        const errors: string[] = [];

        if (!this.isPositiveNumber(order.user_id)) {
            errors.push('user_id는 양수여야 합니다.');
        }

        if (order.user_coupon_id !== null && !this.isNonNegativeNumber(order.user_coupon_id)) {
            errors.push('user_coupon_id는 0 이상이어야 합니다.');
        }

        if (!this.isNonNegativeNumber(order.original_price)) {
            errors.push('original_price는 양수여야 합니다.');
        }

        if (!this.isNonNegativeNumber(order.discount_price)) {
            errors.push('discount_price는 0 이상이어야 합니다.');
        }

        if (!this.isPositiveNumber(order.total_price)) {
            errors.push('total_price는 양수여야 합니다.');
        }

        if (order.total_price > order.original_price) {
            errors.push('total_price는 original_price보다 클 수 없습니다.');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private static isPositiveNumber(value: number): boolean {
        return typeof value === 'number' && value > 0;
    }

    private static isNonNegativeNumber(value: number): boolean {
        return typeof value === 'number' && value >= 0;
    }
}
