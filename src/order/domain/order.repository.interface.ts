import { order as PrismaOrder } from '@prisma/client';

export interface IOrderRepository {
    createOrder(order: PrismaOrder): Promise<PrismaOrder>;
}

export const IORDER_REPOSITORY = Symbol('IORDER_REPOSITORY');
