import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';

export interface IOrderRepository {
    createOrder(
        order: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder>;
    createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail>;
}

export const IORDER_REPOSITORY = Symbol('IORDER_REPOSITORY');
