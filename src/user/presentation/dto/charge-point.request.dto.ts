import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ChargePointRequestDto {
    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    userId: number;

    @ApiProperty({
        example: 1000,
        description: '충전할 포인트 금액',
    })
    @IsNumber()
    @IsPositive()
    amount: number;
}
