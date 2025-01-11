import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentFacade } from '../application/payment.facade';
import { CreatePaymentRequestDto } from './dto/create-payment.request.dto';
import { CreatePaymentResponseDto } from './dto/create-payment.response.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentFacade: PaymentFacade) {}

    @Post()
    @ApiOperation({
        summary: '결제 생성',
        description: '주문에 대한 결제를 생성합니다.',
    })
    @ApiResponse({
        status: 201,
        description: '결제 생성 성공',
        type: CreatePaymentResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '주문 또는 사용자를 찾을 수 없음' })
    async createPayment(
        @Body() createPaymentDto: CreatePaymentRequestDto,
    ): Promise<CreatePaymentResponseDto> {
        const result = await this.paymentFacade.createPayment(createPaymentDto);

        return {
            id: result.id,
            order_id: result.order_id,
            user_id: result.user_id,
            payment_method: result.payment_method,
            status: result.status,
        };
    }
}
