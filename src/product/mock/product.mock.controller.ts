import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDto } from '../application/dto/product.dto';

@ApiTags('Products (Mock)')
@Controller('products')
export class ProductsMockController {
    private salesRecords = [
        { productId: 1, saleDate: this.getSaleDate(0), quantity: 5 },
        { productId: 1, saleDate: this.getSaleDate(1), quantity: 5 },
        { productId: 2, saleDate: this.getSaleDate(0), quantity: 10 },
        { productId: 2, saleDate: this.getSaleDate(1), quantity: 10 },
        { productId: 3, saleDate: this.getSaleDate(0), quantity: 15 },
        { productId: 3, saleDate: this.getSaleDate(1), quantity: 15 },
        { productId: 4, saleDate: this.getSaleDate(0), quantity: 20 },
        { productId: 4, saleDate: this.getSaleDate(1), quantity: 20 },
        { productId: 5, saleDate: this.getSaleDate(0), quantity: 50 },
        { productId: 6, saleDate: this.getSaleDate(0), quantity: 60 },
    ];

    private getSaleDate(daysAgo: number): Date {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
    }

    private products = [
        {
            productId: 1,
            productName: 'Product A',
            price: 100,
            stock: 10,
            status: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        },
        {
            productId: 2,
            productName: 'Product B',
            price: 200,
            stock: 5,
            status: true,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02'),
        },
        {
            productId: 3,
            productName: 'Product C',
            price: 150,
            stock: 20,
            status: true,
            createdAt: new Date('2023-01-03'),
            updatedAt: new Date('2023-01-03'),
        },
        {
            productId: 4,
            productName: 'Product D',
            price: 250,
            stock: 15,
            status: true,
            createdAt: new Date('2023-01-04'),
            updatedAt: new Date('2023-01-04'),
        },
        {
            productId: 5,
            productName: 'Product E',
            price: 300,
            stock: 0,
            status: false,
            createdAt: new Date('2023-01-05'),
            updatedAt: new Date('2023-01-05'),
        },
        {
            productId: 6,
            productName: 'Product F',
            price: 400,
            stock: 15,
            status: false,
            createdAt: new Date('2023-01-05'),
            updatedAt: new Date('2023-01-05'),
        },
    ];

    @Get(':productId')
    @ApiOperation({
        summary: '상품 조회',
        description: '상품 ID를 통해 특정 상품의 정보를 조회합니다.',
    })
    @ApiParam({ name: 'productId', required: true, description: '상품 ID' })
    @ApiResponse({ status: 200, description: '상품 조회 성공', type: ProductDto })
    @ApiResponse({ status: 404, description: '상품을 찾을 수 없음' })
    getProductById(@Param('productId') productId: number): ProductDto {
        const product = this.products.find((p) => p.productId === productId);
        if (!product) {
            throw new NotFoundException(
                `ID가 ${productId}인 상품을 찾을 수 없습니다. ID를 확인하고 다시 시도해 주세요.`,
            );
        }
        return product;
    }

    @Get('top5items/last3days')
    @ApiOperation({
        summary: '최근 3일간 판매량 상위 5개 상품 조회',
        description: '최근 3일간의 판매 기록을 기반으로 판매량 상위 5개 상품을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '상위 5개 상품 조회 성공 (최대 5개 요소 포함)',
        type: [ProductDto],
    })
    @ApiResponse({ status: 404, description: '판매 기록 없음' })
    getTop5Items3DaysAgo(): ProductDto[] {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        // 최근 3일간의 판매 기록 필터링
        const recentSales = this.salesRecords.filter((record) => {
            const saleDate = new Date(record.saleDate);
            return saleDate >= threeDaysAgo && saleDate <= today;
        });

        // 판매 수량 집계
        const salesCount: Record<number, number> = recentSales.reduce(
            (acc, record) => {
                acc[record.productId] = (acc[record.productId] || 0) + record.quantity;
                return acc;
            },
            {} as Record<number, number>,
        );

        // 상위 5개 상품 조회
        const top5Sellers = Object.entries(salesCount)
            .sort((a, b) => b[1] - a[1]) // 판매 수량 기준으로 정렬
            .slice(0, 5) // 상위 5개
            .map(([productId]) =>
                this.products.find((product) => product.productId === Number(productId)),
            );

        if (top5Sellers.length === 0) {
            throw new NotFoundException('최근 3일간 판매 기록이 없습니다.');
        }

        return top5Sellers;
    }
}
