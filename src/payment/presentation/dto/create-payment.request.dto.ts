import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '../../domain/dto/payment-method.enum';

export class CreatePaymentRequestDto {
    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    @IsNumber()
    @IsPositive()
    user_id: number;

    @ApiProperty({
        example: 1,
        description: '주문 ID',
    })
    @IsNumber()
    @IsPositive()
    order_id: number;

    @ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.POINT,
        description: '결제 수단 (POINT/CARD(카드는 아직 미구현))',
    })
    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod;
}
