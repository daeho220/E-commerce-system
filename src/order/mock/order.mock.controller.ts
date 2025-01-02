import { Controller, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '../application/dto/create-order.dto';
import { OrderResponseDto } from '../application/dto/order-response.dto';

@ApiTags('Orders (Mock)')
@Controller('orders')
export class OrdersMockController {
    private users = [
        {
            userId: 1,
            userName: 'User A',
            point: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            userId: 2,
            userName: 'User B',
            point: 500,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    private products = [
        {
            productId: 1,
            productName: 'Product A',
            price: 100,
            stock: 10,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            productId: 2,
            productName: 'Product B',
            price: 200,
            stock: 5,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    private orders = [];
    private orderIdCounter = 1;

    @Post()
    @ApiOperation({
        summary: '주문 생성',
        description: '사용자 ID, 상품 ID, 수량을 입력받아 주문을 생성합니다.',
    })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 201, description: '주문 생성 성공', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: '사용자 또는 상품을 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    createOrder(@Body() body: CreateOrderDto): OrderResponseDto {
        const { userId, productId, quantity } = body;

        // 사용자 조회
        const user = this.users.find((u) => u.userId === userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // 상품 조회
        const product = this.products.find((p) => p.productId === productId);
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // 재고 확인
        if (product.stock < quantity) {
            throw new BadRequestException('재고 부족');
        }

        // 주문 생성
        const totalPrice = product.price * quantity;
        const order = {
            orderId: this.orderIdCounter++,
            userId: userId,
            createdAt: new Date(),
            totalPrice: totalPrice,
            discountPrice: 0, // 할인 적용 시 추가 로직 필요
            status: 'Pending', // 주문 상태
        };

        this.orders.push(order);

        // 재고 업데이트
        product.stock -= quantity;

        return order; // 생성된 주문 반환
    }
}
