import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { order as PrismaOrder } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(order: PrismaOrder): Promise<PrismaOrder> {
        try {
            return await this.prisma.order.create({
                data: order,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error('주문 생성 중 오류가 발생했습니다. 유효한 데이터를 확인하세요.');
            }

            throw new Error('주문 생성 중 알 수 없는 오류가 발생했습니다.');
        }
    }
}
