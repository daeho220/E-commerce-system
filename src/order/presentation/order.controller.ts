import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderFacade } from '../application/order.facade';
import { CreateOrderRequestDto } from './dto/create-order.request.dto';
import { CreateOrderResponseDto } from './dto/create-order.response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderFacade: OrderFacade) {}

    @Post()
    @ApiOperation({
        summary: '주문 생성',
        description: '상품 주문을 생성합니다.',
    })
    @ApiResponse({
        status: 201,
        description: '주문 생성 성공',
        type: CreateOrderResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '상품 또는 사용자를 찾을 수 없음' })
    async createOrder(
        @Body() createOrderDto: CreateOrderRequestDto,
    ): Promise<CreateOrderResponseDto> {
        const result = await this.orderFacade.createOrder(createOrderDto);

        return {
            id: result.id,
            user_id: result.user_id,
            user_coupon_id: result.user_coupon_id,
            original_price: result.original_price,
            discount_price: result.discount_price,
            total_price: result.total_price,
        };
    }
}
