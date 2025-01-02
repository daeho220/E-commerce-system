import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: 1, description: '상품 ID' })
    productId: number;

    @ApiProperty({ example: 2, description: '수량' })
    quantity: number;
}
