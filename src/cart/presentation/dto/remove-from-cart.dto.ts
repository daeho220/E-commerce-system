import { ApiProperty } from '@nestjs/swagger';

export class RemoveFromCartDto {
    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: [1, 2], description: '삭제할 상품 ID 목록' })
    productIds: number[];
}
