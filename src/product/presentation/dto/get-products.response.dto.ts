import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
    @ApiProperty({
        example: 1,
        description: '상품 ID',
    })
    id: number;

    @ApiProperty({
        example: '맛있는 사과',
        description: '상품명',
    })
    product_name: string;

    @ApiProperty({
        example: 1000,
        description: '상품 가격',
    })
    price: number;

    @ApiProperty({
        example: 100,
        description: '재고 수량',
    })
    stock: number;
}

export class GetProductsResponseDto {
    @ApiProperty({
        description: '상품 목록',
        type: [ProductDto],
    })
    products: ProductDto[];

    @ApiProperty({
        example: 1,
        description: '현재 페이지',
    })
    current_page: number;

    @ApiProperty({
        example: 10,
        description: '페이지당 항목 수',
    })
    limit: number;

    @ApiProperty({
        example: 100,
        description: '전체 상품 수',
    })
    total: number;

    @ApiProperty({
        example: 10,
        description: '전체 페이지 수',
    })
    total_pages: number;
}
