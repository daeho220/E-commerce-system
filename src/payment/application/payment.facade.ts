import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../../database/prisma.service';
import { UserService } from '../../user/domain/service/user.service';
import { OrderService } from '../../order/domain/service/order.service';
import { PaymentService } from '../domain/service/payment.service';
import { FacadeCreatePaymentDto } from './dto/facade-create-payment.dto';
import { payment as PrismaPayment } from '@prisma/client';
import { OrderStatus } from '../../order/domain/type/order-status.enum';
import { PaymentStatus } from '../domain/dto/payment-status.enum';
import { PaymentMethod } from '../domain/dto/payment-method.enum';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
import { HistoryService } from '../../history/domain/service/history.service';
import { FakeDataPlatform } from '../../common/fakeDataplatform';
import { BadRequestException, NotFoundException } from '@nestjs/common';
@Injectable()
export class PaymentFacade {
    constructor(
        private readonly userService: UserService,
        private readonly orderService: OrderService,
        private readonly paymentService: PaymentService,
        private readonly historyService: HistoryService,
        private readonly prisma: PrismaService,
    ) {}

    async createPayment(dto: FacadeCreatePaymentDto): Promise<PrismaPayment> {
        const facadeCreatePaymentDto = plainToInstance(FacadeCreatePaymentDto, dto);

        const errors = await validate(facadeCreatePaymentDto);
        if (errors.length > 0) {
            throw new Error('유효하지 않은 결제 데이터입니다.');
        }

        return await this.prisma.$transaction(async (tx) => {
            // 주문 조회
            const order = await this.orderService.findByUserIdandOrderIdwithLock(
                facadeCreatePaymentDto.user_id,
                facadeCreatePaymentDto.order_id,
                tx,
            );

            // 주문서 상태 검증
            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(`주문서 상태가 ${order.status} 입니다.`);
            }

            // 결제 생성
            const payment = await this.paymentService.createPayment(facadeCreatePaymentDto, tx);

            if (facadeCreatePaymentDto.payment_method === PaymentMethod.POINT) {
                // 사용자 잔액 차감
                await this.userService.useUserPoint(
                    facadeCreatePaymentDto.user_id,
                    order.total_price,
                    tx,
                );

                // 포인트 사용 내역 생성
                await this.historyService.createPointHistory(
                    facadeCreatePaymentDto.user_id,
                    order.total_price,
                    PointChangeType.USE,
                    tx,
                );
            } else if (facadeCreatePaymentDto.payment_method === PaymentMethod.CARD) {
                // 카드 결제
            }

            // 결제 상태 업데이트
            await this.paymentService.updatePaymentStatus(payment.id, PaymentStatus.PAID, tx);

            // 주문서 상태 업데이트
            await this.orderService.updateOrderStatus(order.id, OrderStatus.PAID, tx);

            // 결제 정보 조회
            const result = await this.paymentService.findPaymentByIdWithLock(payment.id, tx);

            // 데이터 플랫폼 전송
            const fakeDataPlatform = new FakeDataPlatform();
            fakeDataPlatform.send();

            return result;
        });
    }
}
