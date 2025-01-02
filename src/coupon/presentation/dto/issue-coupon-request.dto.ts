import { ApiProperty } from '@nestjs/swagger';

export class CouponIssueRequestDto {
    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: 1, description: '쿠폰 ID' })
    couponId: number;
}
