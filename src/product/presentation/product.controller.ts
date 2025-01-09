import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../domain/service/product.service';
import { GetProductsQueryDto } from './dto/get-products.query.dto';
import { GetProductsResponseDto } from './dto/get-products.response.dto';

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
        const { page = 1, limit = 10 } = query;
        return await this.productService.findProducts(page, limit);
    }
}
