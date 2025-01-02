import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartQuantityDto {
    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: 1, description: '상품 ID' })
    productId: number;

    @ApiProperty({ example: 3, description: '변경할 수량' })
    quantity: number;
}
