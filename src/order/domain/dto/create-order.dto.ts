import { IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    original_price: number;

    @IsNotEmpty()
    @IsNumber()
    discount_price: number = 0;

    @IsNotEmpty()
    @IsNumber()
    total_price: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    user_coupon_id: number;
}
