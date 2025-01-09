import { ApiProperty } from '@nestjs/swagger';

class TopSellingProductDto {
    @ApiProperty({
        example: 1,
        description: '상품 ID',
    })
    id: number;

    @ApiProperty({
        example: '인기 상품 A',
        description: '상품명',
    })
    product_name: string;

    @ApiProperty({
        example: 10000,
        description: '상품 가격',
    })
    price: number;

    @ApiProperty({
        example: 100,
        description: '현재 재고',
    })
    stock: number;

    @ApiProperty({
        example: 50,
        description: '판매된 총 수량',
    })
    total_quantity: number;

    @ApiProperty({
        example: 500000,
        description: '총 판매 금액',
    })
    total_amount: number;

    @ApiProperty({
        example: 30,
        description: '주문 횟수',
    })
    order_count: number;
}

export class TopSellingProductsResponseDto {
    @ApiProperty({
        description: '상위 판매 상품 목록',
        type: [TopSellingProductDto],
    })
    products: TopSellingProductDto[];

    @ApiProperty({
        example: '2024-01-01',
        description: '집계 시작일',
    })
    start_date: string;

    @ApiProperty({
        example: '2024-01-03',
        description: '집계 종료일',
    })
    end_date: string;
}
