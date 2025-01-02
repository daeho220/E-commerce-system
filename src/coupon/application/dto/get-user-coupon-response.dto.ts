import { ApiProperty } from '@nestjs/swagger';

export class GetUserCouponResponseDto {
    @ApiProperty({ example: 1, description: '쿠폰 ID' })
    couponId: number;

    @ApiProperty({ example: 'DISCOUNT10', description: '쿠폰 코드' })
    code: string;

    @ApiProperty({ example: 10, description: '할인 금액 또는 비율' })
    discountAmount: number;

    @ApiProperty({ example: 'amount', description: '할인 유형 (percentage, amount)' })
    discountType: string;

    @ApiProperty({ example: '2023-12-31', description: '만료 날짜' })
    expirationDate: string;

    @ApiProperty({ example: '2023-10-01', description: '발급 날짜' })
    issueDate: string;
}
