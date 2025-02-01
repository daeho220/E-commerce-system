import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { OrderStatus } from '../domain/type/order-status.enum';

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(
        order: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        const client = getClient(this.prisma, tx);
        return await client.order.create({
            data: order,
        });
    }

    async createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        const client = getClient(this.prisma, tx);
        return await client.order_detail.create({
            data: orderDetail,
        });
    }

    async updateOrderStatus(
        orderId: number,
        status: OrderStatus,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        const client = getClient(this.prisma, tx);
        return await client.order.update({
            where: { id: orderId },
            data: { status },
        });
    }

    async findByIdwithLock(
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder | null> {
        const client = getClient(this.prisma, tx);

        const result = await client.$queryRaw<
            PrismaOrder[]
        >`SELECT * FROM \`order\` WHERE id = ${orderId} FOR UPDATE`;

        return result[0];
    }

    async findByUserIdandOrderIdwithLock(
        userId: number,
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        const client = getClient(this.prisma, tx);

        const result = await client.$queryRaw<
            PrismaOrder[]
        >`SELECT * FROM \`order\` WHERE id = ${orderId} AND user_id = ${userId} FOR UPDATE`;

        return result[0];
    }

    async findById(orderId: number, tx: Prisma.TransactionClient): Promise<PrismaOrder> {
        const client = getClient(this.prisma, tx);
        return await client.order.findUnique({ where: { id: orderId } });
    }
}
