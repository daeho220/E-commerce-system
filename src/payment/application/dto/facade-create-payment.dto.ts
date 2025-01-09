import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FacadeCreatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    order_id: number;

    @IsNotEmpty()
    @IsString()
    payment_method: string;
}
