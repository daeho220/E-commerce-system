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
import { BadRequestException, ConflictException } from '@nestjs/common';
import { LoggerUtil } from '../../common/utils/logger.util';
import { ExecutionError } from 'redlock';
import { RedisRedlock } from '../../database/redis/redis.redlock';
import { LOCK_TTL } from '../../common/constants/redis.constants';
import { EventBus } from '@nestjs/cqrs';
import { CompleteCreatePaymentEvent } from '../event/complete-create-payment.event';

@Injectable()
export class PaymentFacade {
    constructor(
        private readonly userService: UserService,
        private readonly orderService: OrderService,
        private readonly paymentService: PaymentService,
        private readonly historyService: HistoryService,
        private readonly prisma: PrismaService,
        private readonly redisRedlock: RedisRedlock,
        private readonly eventBus: EventBus,
    ) {}

    // 비관적 락
    // async createPayment(dto: FacadeCreatePaymentDto): Promise<PrismaPayment> {
    //     const facadeCreatePaymentDto = plainToInstance(FacadeCreatePaymentDto, dto);

    //     const errors = await validate(facadeCreatePaymentDto);
    //     if (errors.length > 0) {
    //         throw new BadRequestException('유효하지 않은 결제 데이터입니다.');
    //     }

    //     try {
    //         return await this.prisma.$transaction(async (tx) => {
    //             // 주문 조회
    //             const order = await this.orderService.findByUserIdandOrderIdwithLock(
    //                 facadeCreatePaymentDto.user_id,
    //                 facadeCreatePaymentDto.order_id,
    //                 tx,
    //             );

    //             // 주문서 상태 검증
    //             if (order.status !== OrderStatus.PENDING) {
    //                 throw new BadRequestException(`주문서 상태가 ${order.status} 입니다.`);
    //             }

    //             // 결제 생성
    //             const payment = await this.paymentService.createPayment(facadeCreatePaymentDto, tx);

    //             if (facadeCreatePaymentDto.payment_method === PaymentMethod.POINT) {
    //                 // 사용자 잔액 차감
    //                 await this.userService.useUserPoint(
    //                     facadeCreatePaymentDto.user_id,
    //                     order.total_price,
    //                     tx,
    //                 );

    //                 // 포인트 사용 내역 생성
    //                 await this.historyService.createPointHistory(
    //                     facadeCreatePaymentDto.user_id,
    //                     order.total_price,
    //                     PointChangeType.USE,
    //                     tx,
    //                 );
    //             } else if (facadeCreatePaymentDto.payment_method === PaymentMethod.CARD) {
    //                 // 카드 결제
    //             }

    //             // 결제 상태 업데이트
    //             await this.paymentService.updatePaymentStatus(payment.id, PaymentStatus.PAID, tx);

    //             // 주문서 상태 업데이트
    //             await this.orderService.updateOrderStatus(order.id, OrderStatus.PAID, tx);

    //             // 결제 정보 조회
    //             const result = await this.paymentService.findPaymentByIdWithLock(payment.id, tx);

    //             // 데이터 플랫폼 전송
    //             const fakeDataPlatform = new FakeDataPlatform();
    //             fakeDataPlatform.send();

    //             return result;
    //         });
    //     } catch (error) {
    //         LoggerUtil.error('결제 생성 오류', error, { dto });
    //         throw error;
    //     }
    // }

    // 분산 락
    async createPayment(dto: FacadeCreatePaymentDto): Promise<PrismaPayment> {
        const facadeCreatePaymentDto = plainToInstance(FacadeCreatePaymentDto, dto);

        const errors = await validate(facadeCreatePaymentDto);
        if (errors.length > 0) {
            throw new BadRequestException('유효하지 않은 결제 데이터입니다.');
        }

        const lockKey = `payment:${facadeCreatePaymentDto.order_id}`;

        try {
            const redlock = await this.redisRedlock.getRedlock();
            const lock = await redlock.acquire([lockKey], LOCK_TTL, {
                retryCount: 0,
                retryDelay: 0,
            });

            try {
                const result = await this.prisma.$transaction(async (tx) => {
                    // 주문 조회
                    const order = await this.orderService.findById(
                        facadeCreatePaymentDto.order_id,
                        tx,
                    );

                    // 주문서 상태 검증
                    if (order.status !== OrderStatus.PENDING) {
                        throw new BadRequestException(`주문서 상태가 ${order.status} 입니다.`);
                    }

                    // 결제 생성
                    const payment = await this.paymentService.createPayment(
                        facadeCreatePaymentDto,
                        tx,
                    );

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
                    await this.paymentService.updatePaymentStatus(
                        payment.id,
                        PaymentStatus.PAID,
                        tx,
                    );

                    // 주문서 상태 업데이트
                    await this.orderService.updateOrderStatus(order.id, OrderStatus.PAID, tx);

                    // 결제 정보 조회
                    const result = await this.paymentService.findPaymentByIdWithLock(
                        payment.id,
                        tx,
                    );

                    return result;
                });

                // 결제 완료 이벤트 발행
                this.eventBus.publish(new CompleteCreatePaymentEvent(result.id));
                return result;
            } catch (error) {
                LoggerUtil.error('결제 생성 오류', error, { dto });
                throw error;
            } finally {
                await lock.release();
            }
        } catch (error) {
            LoggerUtil.error('분산락 결제 생성 오류', error, { dto });
            if (error instanceof ExecutionError) {
                throw new ConflictException('다른 사용자가 결제를 생성하고 있습니다.');
            }
            throw error;
        }
    }
}
