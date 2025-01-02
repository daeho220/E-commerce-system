import { ApiProperty } from '@nestjs/swagger';

export class CouponResponseDto {
    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: 1, description: '쿠폰 ID' })
    couponId: number;

    @ApiProperty({ example: '2023-12-31', description: '만료 날짜' })
    expirationDate: string;
}
