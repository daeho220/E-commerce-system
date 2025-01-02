import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
    @ApiProperty({ example: 1, description: '장바구니 항목 ID' })
    cartItemsId: number;

    @ApiProperty({ example: 1, description: '사용자 식별자' })
    userId: number;

    @ApiProperty({ example: 1, description: '상품 ID' })
    productId: number;

    @ApiProperty({ example: 2, description: '수량' })
    quantity: number;

    @ApiProperty({ example: '2025-01-01T00:00:00Z', description: '생성일' })
    createdAt: Date;

    @ApiProperty({ example: '2025-01-01T00:00:00Z', description: '수정일' })
    updatedAt: Date;
}
