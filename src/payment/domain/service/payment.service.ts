import { Injectable, Inject } from '@nestjs/common';
import { payment as PrismaPayment, Prisma } from '@prisma/client';
import { IPaymentRepository } from '../payment.repository.interface';
import { IPAYMENT_REPOSITORY } from '../payment.repository.interface';
import { CommonValidator } from '../../../common/common-validator';
import { PaymentStatus } from '../dto/payment-status.enum';
import { PaymentStatusValidator } from '../../util/payment-status-validator';
import { PaymentValidator } from '../../util/payment-validator';
@Injectable()
export class PaymentService {
    constructor(
        @Inject(IPAYMENT_REPOSITORY)
        private readonly paymentRepository: IPaymentRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    async createPayment(
        payment: Omit<PrismaPayment, 'id' | 'created_at' | 'status'>,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        const validation = PaymentValidator.validate(payment);

        if (!validation.isValid) {
            throw new Error(`유효하지 않은 데이터입니다.`);
        }

        return await this.paymentRepository.createPayment(payment, tx);
    }

    async findPaymentByIdWithLock(
        paymentId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment | null> {
        this.commonValidator.validatePaymentId(paymentId);
        return await this.paymentRepository.findPaymentByIdWithLock(paymentId, tx);
    }

    async updatePaymentStatus(
        paymentId: number,
        status: PaymentStatus,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        this.commonValidator.validatePaymentId(paymentId);
        PaymentStatusValidator.validate(status);
        return await this.paymentRepository.updatePaymentStatus(paymentId, status, tx);
    }
}
