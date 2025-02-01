import { Test, TestingModule } from '@nestjs/testing';
import { PaymentModule } from '../payment.module';
import { PrismaModule } from '../../database/prisma.module';
import { PrismaService } from '../../database/prisma.service';
import { PaymentMethod } from '../domain/dto/payment-method.enum';
import { PaymentStatus } from '../domain/dto/payment-status.enum';
import { PaymentFacade } from './payment.facade';
import { FacadeCreatePaymentDto } from './dto/facade-create-payment.dto';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../configs/winston.config';

describe('PaymentFacade', () => {
    let facade: PaymentFacade;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PaymentModule, PrismaModule, WinstonModule.forRoot(winstonConfig)],
        }).compile();

        facade = module.get<PaymentFacade>(PaymentFacade);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createPayment: 결제 생성 테스트', () => {
        describe('동시성 테스트', () => {
            describe('동일한 유저가 동일한 주문을 동시에 5번 결제 요청하면 1번만 성공하고, 4번은 실패한다.', () => {
                it('비관적 락', async () => {
                    // given
                    const createPaymentDto = new FacadeCreatePaymentDto();
                    createPaymentDto.user_id = 34;
                    createPaymentDto.order_id = 15;
                    createPaymentDto.payment_method = PaymentMethod.POINT;

                    const promises = Array.from({ length: 5 }, () =>
                        facade.createPayment(createPaymentDto),
                    );

                    // when
                    const results = await Promise.allSettled(promises);

                    const successCount = results.filter(
                        (result) => result.status === 'fulfilled',
                    ).length;
                    const failedCount = results.filter(
                        (result) => result.status === 'rejected',
                    ).length;

                    const payment = await prisma.payment.findFirst({
                        where: {
                            user_id: createPaymentDto.user_id,
                            order_id: createPaymentDto.order_id,
                        },
                    });

                    // then
                    expect(successCount).toBe(1);
                    expect(failedCount).toBe(4);
                    expect(payment?.status).toBe(PaymentStatus.PAID);
                });
                it('분산 락', async () => {
                    // given
                    const createPaymentDto = new FacadeCreatePaymentDto();
                    createPaymentDto.user_id = 12;
                    createPaymentDto.order_id = 12;
                    createPaymentDto.payment_method = PaymentMethod.POINT;

                    const promises = Array.from({ length: 5 }, () =>
                        facade.createPaymentWithDistributedLock(createPaymentDto),
                    );

                    // when
                    const results = await Promise.allSettled(promises);

                    const successCount = results.filter(
                        (result) => result.status === 'fulfilled',
                    ).length;
                    const failedCount = results.filter(
                        (result) => result.status === 'rejected',
                    ).length;

                    const payment = await prisma.payment.findFirst({
                        where: {
                            user_id: createPaymentDto.user_id,
                            order_id: createPaymentDto.order_id,
                        },
                    });

                    // then
                    expect(successCount).toBe(1);
                    expect(failedCount).toBe(4);
                    expect(payment?.status).toBe(PaymentStatus.PAID);
                });
            });
        });
    });
});
