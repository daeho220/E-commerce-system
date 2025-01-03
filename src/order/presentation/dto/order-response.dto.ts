import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
    @ApiProperty({ example: 1, description: '주문 ID' })
    orderId: number;

    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: '2023-10-05T12:34:56.789Z', description: '주문 생성 시각' })
    createdAt: Date;

    @ApiProperty({ example: 300, description: '총 금액' })
    totalPrice: number;

    @ApiProperty({ example: 0, description: '할인 금액' })
    discountPrice: number;

    @ApiProperty({
        example: 'PENDING',
        description:
            '주문 상태 (PENDING: 결제 중 , PAID: 결제 완료, CANCELLED: 주문 취소, FAILED: 결제 실패) ',
    })
    status: string;
}
