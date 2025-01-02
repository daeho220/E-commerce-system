import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
    @ApiProperty({ example: 1, description: '결제 ID' })
    paymentId: number;

    @ApiProperty({ example: 1, description: '주문 ID' })
    orderId: number;

    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: 300, description: '결제 금액' })
    totalPrice: number;

    @ApiProperty({ example: 'POINT', description: '결제 방법' })
    paymentMethod: string;

    @ApiProperty({
        example: 'PAID',
        description: '결제 상태 (PENDING: 결제 중 , PAID: 결제 완료, FAILED: 결제 실패)',
    })
    status: string;

    @ApiProperty({ example: '2023-10-05T12:34:56.789Z', description: '결제 시각' })
    createdAt: Date;
}
