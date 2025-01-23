import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { OrderStatus } from './type/order-status.enum';
export interface IOrderRepository {
    createOrder(
        order: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder>;
    createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail>;
    updateOrderStatus(
        orderId: number,
        status: OrderStatus,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder>;
    findByIdwithLock(orderId: number, tx: Prisma.TransactionClient): Promise<PrismaOrder | null>;
    findByUserIdandOrderIdwithLock(
        userId: number,
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder>;
    findById(orderId: number, tx: Prisma.TransactionClient): Promise<PrismaOrder>;
}

export const IORDER_REPOSITORY = Symbol('IORDER_REPOSITORY');
