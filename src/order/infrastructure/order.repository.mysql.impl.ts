import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { OrderStatus } from '../domain/type/order-status.enum';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(
        order: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        try {
            const client = getClient(this.prisma, tx);
            return await client.order.create({
                data: order,
            });
        } catch (error) {
            throw new Error(`[주문 생성 오류]: ${error}`);
        }
    }

    async createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        try {
            const client = getClient(this.prisma, tx);
            return await client.order_detail.create({
                data: orderDetail,
            });
        } catch (error) {
            throw new Error(`[주문 상세 생성 오류]: ${error}`);
        }
    }

    async updateOrderStatus(
        orderId: number,
        status: OrderStatus,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        try {
            const client = getClient(this.prisma, tx);
            return await client.order.update({
                where: { id: orderId },
                data: { status },
            });
        } catch (error) {
            throw new Error(`[주문 상태 업데이트 오류]: ${error}`);
        }
    }

    async findByIdwithLock(
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder | null> {
        const client = getClient(this.prisma, tx);

        const result = await client.$queryRaw<
            PrismaOrder[]
        >`SELECT * FROM \`order\` WHERE id = ${orderId} FOR UPDATE`;

        if (result.length === 0) {
            throw new NotFoundException(`ID가 ${orderId}인 주문을 찾을 수 없습니다.`);
        }

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

        if (result.length === 0) {
            throw new NotFoundException(
                `주문 ID ${orderId}, 사용자 ID ${userId} 주문을 찾을 수 없습니다.`,
            );
        }

        return result[0];
    }
}
