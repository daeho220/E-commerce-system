import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class IssueCouponRequestDto {
    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    @IsNumber()
    @IsPositive()
    user_id: number;

    @ApiProperty({
        example: 1,
        description: '발급받을 쿠폰 ID',
    })
    @IsNumber()
    @IsPositive()
    coupon_id: number;
}
