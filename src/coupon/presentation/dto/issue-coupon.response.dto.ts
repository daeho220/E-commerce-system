import { ApiProperty } from '@nestjs/swagger';

export class IssueCouponResponseDto {
    @ApiProperty({
        example: 1,
        description: '발급된 사용자 쿠폰 ID',
    })
    id: number;

    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    user_id: number;

    @ApiProperty({
        example: 1,
        description: '쿠폰 ID',
    })
    coupon_id: number;

    @ApiProperty({
        example: 'AVAILABLE',
        description: '쿠폰 상태',
    })
    status: string;

    @ApiProperty({
        example: '2024-12-31T23:59:59.999Z',
        description: '쿠폰 만료일',
    })
    expiration_date: Date;
}
