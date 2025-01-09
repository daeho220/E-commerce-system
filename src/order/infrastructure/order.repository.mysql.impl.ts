import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { getClient } from '../../common/util';

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
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error('주문 생성 중 오류가 발생했습니다. 유효한 데이터를 확인하세요.');
            }

            throw new Error('주문 생성 중 알 수 없는 오류가 발생했습니다.');
        }
    }

    async createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        try {
            const client = getClient(this.prisma, tx);
            return await client.order_detail.create({
                data: orderDetail,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error(
                    '주문 상세 생성 중 오류가 발생했습니다. 유효한 데이터를 확인하세요.',
                );
            }

            throw new Error('주문 디테일 생성 중 알 수 없는 오류가 발생했습니다.');
        }
    }
}
