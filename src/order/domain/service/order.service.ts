import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { OrderValidator } from '../../util/order-validator';
import { OrderDetailValidator } from '../../util/orderDetail-validator';

@Injectable()
export class OrderService {
    constructor(
        @Inject(IORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
    ) {}

    async createOrder(
        orderData: Omit<PrismaOrder, 'id' | 'created_at' | 'status'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        const validation = OrderValidator.validate(orderData);

        if (!validation.isValid) {
            throw new Error(`유효하지 않은 데이터입니다.`);
        }

        return await this.orderRepository.createOrder(orderData, tx);
    }

    async createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        const validation = OrderDetailValidator.validate(orderDetail);

        if (!validation.isValid) {
            throw new Error(`유효하지 않은 데이터입니다.`);
        }

        return await this.orderRepository.createOrderDetail(orderDetail, tx);
    }
}
