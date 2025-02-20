import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPaymentRepository } from '../domain/payment.repository.interface';
import { payment as PrismaPayment, Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createPayment(
        payment: Omit<PrismaPayment, 'id' | 'created_at' | 'status'>,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment> {
        const client = getClient(this.prisma, tx);
        return await client.payment.create({
            data: payment,
        });
    }

    async findPaymentByIdWithLock(
        paymentId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment | null> {
        const client = getClient(this.prisma, tx);
        const payment = await client.$queryRaw<PrismaPayment[]>`
                SELECT * FROM payment WHERE id = ${paymentId} FOR UPDATE
            `;
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
