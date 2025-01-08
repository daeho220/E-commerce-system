import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { order as PrismaOrder } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderMapper } from '../mappers/OrderDtoToPrisma.mapper';
import { validate } from 'class-validator';

@Injectable()
export class OrderService {
    constructor(
        @Inject(IORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
    ) {}

    async createOrder(createOrderDto: CreateOrderDto): Promise<PrismaOrder> {
        const errors = await validate(createOrderDto);
        if (errors.length > 0) {
            throw new Error('유효하지 않은 데이터입니다.');
        }

        const orderData: PrismaOrder = OrderMapper.toPrismaOrder(createOrderDto);
        return await this.orderRepository.createOrder(orderData);
    }
}
