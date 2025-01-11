import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentResponseDto {
    @ApiProperty({
        example: 1,
        description: '결제 ID',
    })
    id: number;

    @ApiProperty({
        example: 1,
        description: '주문 ID',
    })
    order_id: number;

    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    user_id: number;

    @ApiProperty({
        example: 'POINT',
        description: '결제 수단',
    })
    payment_method: string;

    @ApiProperty({
        example: 'PAID',
        description: '결제 상태',
    })
    status: string;
}
