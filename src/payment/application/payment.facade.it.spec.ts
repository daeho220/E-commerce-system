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
        describe('성공 케이스', () => {
            it('잔고가 20000원인 유저가 1800원 주문 결제를 할 때, 결제 생성 성공', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 2;
                createPaymentDto.order_id = 2;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                const result = await facade.createPayment(createPaymentDto);

                // then
                expect(result.user_id).toBe(createPaymentDto.user_id);
                expect(result.order_id).toBe(createPaymentDto.order_id);
                expect(result.payment_method).toBe(createPaymentDto.payment_method);
                expect(result.status).toBe(PaymentStatus.PAID);
            });
        });
        describe('실패 케이스', () => {
            it('잔고가 600원인 유저가 5400원 주문 결제를 할 때, 결제 생성 실패', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 6;
                createPaymentDto.order_id = 6;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                // when & then
                await expect(facade.createPayment(createPaymentDto)).rejects.toThrow(Error);
            });
            it('사용자의 잔고는 충분하지만, 주문서의 상태가 PENDING이 아니면 결제 생성 실패', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 4;
                createPaymentDto.order_id = 4;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                // when & then
                await expect(facade.createPayment(createPaymentDto)).rejects.toThrow(
                    '주문서 상태가 FAILED 입니다.',
                );
            });
        });
        describe('동시성 테스트', () => {
            it('동일한 유저가 동일한 주문을 동시에 5번 결제 요청하면 1번만 성공하고, 4번은 실패한다.', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 3;
                createPaymentDto.order_id = 3;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                const promises = Array.from({ length: 5 }, () =>
                    facade.createPayment(createPaymentDto),
                );

                // when
                const results = await Promise.allSettled(promises);

                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failedCount = results.filter((result) => result.status === 'rejected').length;

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
