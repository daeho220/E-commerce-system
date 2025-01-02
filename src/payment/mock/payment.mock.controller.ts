import { Controller, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentResponseDto } from '../interfaces/dto/payment-response.dto';
import { PaymentRequestDto } from '../interfaces/dto/payment-request.dto';

@ApiTags('Payment (Mock)')
@Controller('payments')
export class PaymentsMockController {
    private users = [
        { userId: 1, userName: 'User A', point: 1000 },
        { userId: 2, userName: 'User B', point: 500 },
    ];

    private orders = [
        { orderId: 1, userId: 1, totalPrice: 300, status: 'Pending' },
        { orderId: 2, userId: 2, totalPrice: 200, status: 'Pending' },
    ];

    private paymentIdCounter = 1; // 결제 ID 카운터

    @Post()
    @ApiOperation({
        summary: '포인트 사용 (결제)',
        description: '사용자 ID와 주문 ID를 입력받아 결제를 수행합니다.',
    })
    @ApiResponse({ status: 200, description: '결제 성공', type: PaymentResponseDto })
    @ApiResponse({ status: 404, description: '사용자 또는 주문을 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잔액 부족' })
    usePoints(@Body() body: PaymentRequestDto): PaymentResponseDto {
        const { userId, orderId } = body;

        const user = this.users.find((u) => u.userId === userId);
        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }

        const order = this.orders.find((o) => o.orderId === orderId);
        if (!order) {
            throw new NotFoundException(`ID가 ${orderId}인 주문을 찾을 수 없습니다.`);
        }

        const totalPrice = order.totalPrice;

        if (user.point < totalPrice) {
            throw new BadRequestException('포인트가 부족합니다.');
        }

        // 포인트 차감
        user.point -= totalPrice;

        // 결제 내역 생성
        const paymentResponse: PaymentResponseDto = {
            paymentId: this.paymentIdCounter++,
            orderId: orderId,
            userId: userId,
            totalPrice: totalPrice,
            paymentMethod: 'POINT',
            status: 'PAID',
            createdAt: new Date(),
        };

        return paymentResponse;
    }
}
