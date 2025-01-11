import { payment as PrismaPayment } from '@prisma/client';
import { PaymentMethod } from '../domain/dto/payment-method.enum';

export class PaymentValidator {
    static validate(payment: Omit<PrismaPayment, 'id' | 'created_at' | 'status'>) {
        const errors: string[] = [];

        if (!this.isPositiveNumber(payment.user_id)) {
            errors.push('user_id는 양수여야 합니다.');
        }

        if (!this.isPositiveNumber(payment.order_id)) {
            errors.push('order_id는 양수여야 합니다.');
        }
        if (!Object.values(PaymentMethod).includes(payment.payment_method as PaymentMethod)) {
            errors.push('payment_method는 유효한 값이어야 합니다.');
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
