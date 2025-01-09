import { PaymentStatus } from '../domain/dto/payment-status.enum';
import { BadRequestException } from '@nestjs/common';
export class PaymentStatusValidator {
    static validate(status: PaymentStatus): void {
        if (!Object.values(PaymentStatus).includes(status)) {
            throw new BadRequestException('유효하지 않은 결제 상태입니다.');
        }
    }
}
