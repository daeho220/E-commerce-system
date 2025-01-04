import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: 2, description: '상품 ID' })
    productId: number;

    @ApiProperty({ example: 3, description: '주문 수량' })
    quantity: number;
}
