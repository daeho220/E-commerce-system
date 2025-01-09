import { ApiProperty } from '@nestjs/swagger';

export class ChargePointResponseDto {
    @ApiProperty({
        example: 1,
        description: '유저 ID',
    })
    id: number;

    @ApiProperty({
        example: 'John',
        description: '유저 이름',
    })
    userName: string;

    @ApiProperty({
        example: 1000,
        description: '현재 포인트 잔액',
    })
    point: number;
}
