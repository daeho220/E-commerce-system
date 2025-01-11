import { ApiProperty } from '@nestjs/swagger';

export class CouponListResponseDto {
    @ApiProperty({
        example: 1,
        description: '쿠폰 ID',
    })
    id: number;

    @ApiProperty({
        example: 'PERCENTAGE',
        description: '할인 유형 (PERCENTAGE/AMOUNT)',
    })
    discount_type: string;

    @ApiProperty({
        example: 10,
        description: '할인 금액 또는 비율',
    })
    discount_amount: number;

    @ApiProperty({
        example: '신규 가입 쿠폰',
        description: '쿠폰 이름',
    })
    code: string;
}
