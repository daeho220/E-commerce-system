import {
    Injectable,
    Inject,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { payment as PrismaPayment, Prisma } from '@prisma/client';
import { IPaymentRepository } from '../payment.repository.interface';
import { IPAYMENT_REPOSITORY } from '../payment.repository.interface';
import { CommonValidator } from '../../../common/common-validator';
import { PaymentStatus } from '../dto/payment-status.enum';
import { PaymentStatusValidator } from '../../util/payment-status-validator';
import { PaymentValidator } from '../../util/payment-validator';
import { BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LoggerUtil } from '../../../common/utils/logger.util';
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
            throw new BadRequestException('유효하지 않은 데이터입니다.');
        }
        try {
            return await this.paymentRepository.createPayment(payment, tx);
        } catch (error) {
            LoggerUtil.error('결제 생성 오류', error, { payment });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException('결제 생성 중 오류가 발생했습니다.');
        }
    }

    async findPaymentByIdWithLock(
        paymentId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment | null> {
        this.commonValidator.validatePaymentId(paymentId);
        try {
            const payment = await this.paymentRepository.findPaymentByIdWithLock(paymentId, tx);

            if (!payment) {
                throw new NotFoundException(`ID가 ${paymentId}인 결제 정보를 찾을 수 없습니다.`);
            }

            return payment;
        } catch (error) {
            LoggerUtil.error('결제 조회 오류', error, { paymentId });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('결제 조회 중 오류가 발생했습니다.');
        }
    }

    async updatePaymentStatus(
        paymentId: number,
        status: PaymentStatus,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        this.commonValidator.validatePaymentId(paymentId);
        PaymentStatusValidator.validate(status);
        try {
            return await this.paymentRepository.updatePaymentStatus(paymentId, status, tx);
        } catch (error) {
            LoggerUtil.error('결제 상태 업데이트 오류', error, { paymentId, status });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException('결제 상태 업데이트 중 오류가 발생했습니다.');
        }
    }
}
