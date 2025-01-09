import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @ApiProperty({
        example: 1,
        description: '상품 ID',
    })
    @IsNumber()
    @IsPositive()
    product_id: number;

    @ApiProperty({
        example: 2,
        description: '주문 수량',
    })
    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class CreateOrderRequestDto {
    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    @IsNumber()
    @IsPositive()
    user_id: number;

    @ApiProperty({
        example: 1,
        description: '쿠폰 ID',
        required: false,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    coupon_id?: number;

    @ApiProperty({
        type: [OrderItemDto],
        description: '주문 상품 목록',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    order_items: OrderItemDto[];
}
