import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderResponseDto {
    @ApiProperty({
        example: 1,
        description: '주문 ID',
    })
    id: number;

    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    user_id: number;

    @ApiProperty({
        example: 1,
        description: '사용된 쿠폰 ID',
        nullable: true,
    })
    user_coupon_id: number | null;

    @ApiProperty({
        example: 10000,
        description: '할인 전 가격',
    })
    original_price: number;

    @ApiProperty({
        example: 1000,
        description: '할인 금액',
    })
    discount_price: number;

    @ApiProperty({
        example: 9000,
        description: '최종 결제 금액',
    })
    total_price: number;
}
