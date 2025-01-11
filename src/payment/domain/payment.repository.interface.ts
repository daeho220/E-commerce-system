import { payment as PrismaPayment, Prisma } from '@prisma/client';

export interface IPaymentRepository {
    createPayment(
        payment: Omit<PrismaPayment, 'id' | 'created_at' | 'status'>,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment>;

    findPaymentByIdWithLock(
        paymentId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment | null>;

    updatePaymentStatus(
        paymentId: number,
        status: string,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPayment>;
}

export const IPAYMENT_REPOSITORY = Symbol('IPAYMENT_REPOSITORY');
