import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { OrderValidator } from '../../util/order-validator';
import { OrderDetailValidator } from '../../util/orderDetail-validator';
import { OrderStatus } from '../type/order-status.enum';
import { CommonValidator } from '../../../common/common-validator';
import { OrderStatusValidator } from '../../util/order-status-validator';
@Injectable()
export class OrderService {
    constructor(
        @Inject(IORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
        private readonly commonValidator: CommonValidator,
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
        orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        const validation = OrderDetailValidator.validate(orderDetail);

        if (!validation.isValid) {
            throw new Error(`유효하지 않은 데이터입니다.`);
        }

        return await this.orderRepository.createOrderDetail(orderDetail, tx);
    }

    async findByIdwithLock(
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder | null> {
        this.commonValidator.validateOrderId(orderId);
        return await this.orderRepository.findByIdwithLock(orderId, tx);
    }

    async updateOrderStatus(
        orderId: number,
        status: OrderStatus,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        this.commonValidator.validateOrderId(orderId);
        OrderStatusValidator.validate(status);
        return await this.orderRepository.updateOrderStatus(orderId, status, tx);
    }

    async findByUserIdandOrderIdwithLock(
        userId: number,
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validateOrderId(orderId);
        return await this.orderRepository.findByUserIdandOrderIdwithLock(userId, orderId, tx);
    }
}
