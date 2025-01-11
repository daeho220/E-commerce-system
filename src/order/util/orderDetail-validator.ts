import { order_detail as PrismaOrderDetail } from '@prisma/client';

export class OrderDetailValidator {
    static validate(orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>) {
        const errors: string[] = [];

        if (!this.isPositiveNumber(orderDetail.order_id)) {
            errors.push('order_id는 양수여야 합니다.');
        }

        if (!this.isPositiveNumber(orderDetail.product_id)) {
            errors.push('product_id는 양수여야 합니다.');
        }

        if (!this.isPositiveNumber(orderDetail.quantity)) {
            errors.push('quantity는 양수여야 합니다.');
        }

        if (!this.isPositiveNumber(orderDetail.price_at_purchase)) {
            errors.push('price_at_purchase는 양수여야 합니다.');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private static isPositiveNumber(value: number): boolean {
        return typeof value === 'number' && value > 0;
    }
}
