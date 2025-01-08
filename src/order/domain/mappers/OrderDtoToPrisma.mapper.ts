import { CreateOrderDto } from '../dto/create-order.dto';
import { order as PrismaOrder } from '@prisma/client';
import { OrderStatus } from '../dto/order-status.enum';

export class OrderMapper {
    static toPrismaOrder(createOrderDto: CreateOrderDto): PrismaOrder {
        return {
            id: 0, // ID는 데이터베이스에서 자동 생성되므로 0으로 설정
            user_id: createOrderDto.user_id,
            user_coupon_id: createOrderDto.user_coupon_id || null,
            original_price: createOrderDto.original_price,
            discount_price: createOrderDto.discount_price || 0,
            total_price: createOrderDto.total_price,
            status: OrderStatus.PENDING,
            created_at: new Date(),
        };
    }
}
