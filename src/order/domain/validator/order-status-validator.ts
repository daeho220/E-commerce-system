import { OrderStatus } from '../type/order-status.enum';
import { BadRequestException } from '@nestjs/common';
export class OrderStatusValidator {
    static validate(status: OrderStatus): void {
        if (!Object.values(OrderStatus).includes(status)) {
            throw new BadRequestException('유효하지 않은 주문 상태입니다.');
        }
    }
}
