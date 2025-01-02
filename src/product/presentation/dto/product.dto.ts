// src/products/dto/top-seller.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
    @ApiProperty({ example: 1, description: '상품 ID' })
    productId: number;

    @ApiProperty({ example: '진공 청소기', description: '상품 이름' })
    productName: string;

    @ApiProperty({ example: 10000, description: '상품 가격' })
    price: number;

    @ApiProperty({ example: 100, description: '재고 수량' })
    stock: number;

    @ApiProperty({ example: true, description: '상품 상태' })
    status: boolean;

    @ApiProperty({ example: '2023-10-05T12:34:56.789Z', description: '생성 일자' })
    createdAt: Date;

    @ApiProperty({ example: '2023-10-05T12:34:56.789Z', description: '수정 일자' })
    updatedAt: Date;
}
