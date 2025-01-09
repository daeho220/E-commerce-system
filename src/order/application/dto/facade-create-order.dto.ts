import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    Min,
    ValidateNested,
    ArrayNotEmpty,
    IsOptional,
} from 'class-validator';

export class OrderItemDto {
    @IsInt()
    @IsNotEmpty()
    product_id: number;

    @IsInt()
    @Min(1, { message: '상품의 수량은 1개 이상이어야 합니다.' })
    quantity: number;
}

export class FacadeCreateOrderDto {
    @IsInt()
    @IsNotEmpty()
    user_id: number;

    @IsInt()
    @IsOptional()
    coupon_id: number | null;

    @IsArray()
    @ArrayNotEmpty({ message: '주문 상품 목록이 비어있습니다.' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    order_items: OrderItemDto[];
}
