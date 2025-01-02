import { ApiProperty } from '@nestjs/swagger';

export class PaymentRequestDto {
    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: 1, description: '주문 ID' })
    orderId: number;
}
