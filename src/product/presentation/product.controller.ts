import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../domain/service/product.service';
import { GetProductsQueryDto } from './dto/get-products.query.dto';
import { GetProductsResponseDto } from './dto/get-products.response.dto';
import { TopSellingProductsResponseDto } from './dto/top-selling-products.response.dto';
@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    @ApiOperation({
        summary: '상품 목록 조회',
        description: '상품 목록을 페이지네이션하여 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '상품 목록 조회 성공',
        type: GetProductsResponseDto,
    })
    @ApiResponse({ status: 404, description: '상품이 존재하지 않습니다.' })
    async getProducts(@Query() query: GetProductsQueryDto): Promise<GetProductsResponseDto> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        return await this.productService.findProducts(page, limit);
    }

    @Get('top-selling-products/in3days')
    @ApiOperation({
        summary: '최근 3일간 가장 많이 팔린 상위 5개 상품 조회',
        description: '최근 3일간 가장 많이 팔린 상위 5개 상품을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '최근 3일간 가장 많이 팔린 상위 5개 상품 조회 성공',
        type: TopSellingProductsResponseDto,
    })
    @ApiResponse({ status: 404, description: '상품이 존재하지 않습니다.' })
    async getTopSellingProductsIn3Days(): Promise<TopSellingProductsResponseDto> {
        return await this.productService.findTop5SellingProductsIn3Days();
    }
}
