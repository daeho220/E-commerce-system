import { ApiProperty } from '@nestjs/swagger';

export class PointRequestDto {
    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: 100, description: '사용/충전할 금액' })
    amount: number;
}
