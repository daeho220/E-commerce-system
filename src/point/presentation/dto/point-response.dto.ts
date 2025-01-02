import { ApiProperty } from '@nestjs/swagger';

export class PointResponseDto {
    @ApiProperty({ example: 1, description: '사용자 ID' })
    userId: number;

    @ApiProperty({ example: 1100, description: '사용/충전 후 사용자 포인트' })
    point: number;
}
