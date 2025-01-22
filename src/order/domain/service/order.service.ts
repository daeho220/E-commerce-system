import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import {
    Injectable,
    Inject,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { OrderValidator } from '../validator/order-validator';
import { OrderDetailValidator } from '../validator/orderDetail-validator';
import { OrderStatus } from '../type/order-status.enum';
import { CommonValidator } from '../../../common/common-validator';
import { OrderStatusValidator } from '../validator/order-status-validator';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LoggerUtil } from '../../../common/utils/logger.util';
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
            throw new BadRequestException(`유효하지 않은 데이터입니다.`);
        }

        try {
            return await this.orderRepository.createOrder(orderData, tx);
        } catch (error) {
            LoggerUtil.error('주문 생성 오류', error, orderData);
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(`주문 생성 중 오류가 발생했습니다.`);
        }
    }

    async createOrderDetail(
        orderDetail: Omit<PrismaOrderDetail, 'id' | 'created_at'>,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrderDetail> {
        const validation = OrderDetailValidator.validate(orderDetail);

        if (!validation.isValid) {
            throw new BadRequestException(`유효하지 않은 데이터입니다.`);
        }

        try {
            return await this.orderRepository.createOrderDetail(orderDetail, tx);
        } catch (error) {
            LoggerUtil.error('주문 상세 생성 오류', error, orderDetail);
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(`주문 상세 생성 중 오류가 발생했습니다.`);
        }
    }

    async findByIdwithLock(
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder | null> {
        this.commonValidator.validateOrderId(orderId);
        try {
            const order = await this.orderRepository.findByIdwithLock(orderId, tx);
            if (!order) {
                throw new NotFoundException(`ID가 ${orderId}인 주문을 찾을 수 없습니다.`);
            }
            return order;
        } catch (error) {
            LoggerUtil.error('주문 조회 오류', error, { orderId });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(`주문 조회 중 오류가 발생했습니다.`);
        }
    }

    async updateOrderStatus(
        orderId: number,
        status: OrderStatus,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        this.commonValidator.validateOrderId(orderId);
        OrderStatusValidator.validate(status);
        try {
            return await this.orderRepository.updateOrderStatus(orderId, status, tx);
        } catch (error) {
            LoggerUtil.error('주문 상태 업데이트 오류', error, { orderId, status });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(`주문 상태 업데이트 오류가 발생했습니다.`);
        }
    }

    async findByUserIdandOrderIdwithLock(
        userId: number,
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validateOrderId(orderId);
        try {
            const order = await this.orderRepository.findByUserIdandOrderIdwithLock(
                userId,
                orderId,
                tx,
            );

            if (!order) {
                throw new NotFoundException(
                    `주문 ID ${orderId}, 사용자 ID ${userId} 주문을 찾을 수 없습니다.`,
                );
            }

            return order;
        } catch (error) {
            LoggerUtil.error('주문 조회 오류', error, { userId, orderId });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(`주문 조회 오류가 발생했습니다.`);
        }
    }

    async findByUserIdandOrderId(
        userId: number,
        orderId: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaOrder> {
        return await this.orderRepository.findByUserIdandOrderId(userId, orderId, tx);
    }
}
