import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPaymentRepository } from '../domain/payment.repository.interface';
import { payment as PrismaPayment, Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createPayment(
        payment: Omit<PrismaPayment, 'id' | 'created_at' | 'status'>,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        try {
            const client = getClient(this.prisma, tx);
            return await client.payment.create({
                data: payment,
            });
        } catch (error) {
            throw new Error(`[결제 생성 오류]: ${error}`);
        }
    }

    async findPaymentByIdWithLock(
        paymentId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment | null> {
        const client = getClient(this.prisma, tx);
        const payment = await client.$queryRaw<PrismaPayment[]>`
            SELECT * FROM payment WHERE id = ${paymentId} FOR UPDATE
        `;

        if (payment.length === 0) {
            throw new NotFoundException(`ID가 ${paymentId}인 결제 정보를 찾을 수 없습니다.`);
        }

        return payment[0];
    }

    async updatePaymentStatus(
        paymentId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        const client = getClient(this.prisma, tx);
        return await client.payment.update({
            where: { id: paymentId },
            data: { status },
        });
    }
}
