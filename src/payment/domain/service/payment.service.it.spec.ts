import { Test, TestingModule } from '@nestjs/testing';
import { PaymentModule } from '../../payment.module';
import { PrismaModule } from '../../../database/prisma.module';
import { payment as PrismaPayment } from '@prisma/client';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../../database/prisma.service';
import { PaymentMethod } from '../dto/payment-method.enum';
import { PaymentStatus } from '../dto/payment-status.enum';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../../configs/winston.config';
describe('PaymentService', () => {
    let service: PaymentService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PaymentModule, PrismaModule, WinstonModule.forRoot(winstonConfig)],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createPayment: 결제 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 결제 데이터가 주어지면 결제를 생성한다', async () => {
                // given
                const paymentData = {
                    user_id: 11,
                    order_id: 11,
                    payment_method: PaymentMethod.POINT,
                };

                // when
                const result: PrismaPayment = await prisma.$transaction(async (tx) => {
                    return await service.createPayment(paymentData, tx);
                });

                // then
                expect(result.user_id).toEqual(paymentData.user_id);
                expect(result.order_id).toEqual(paymentData.order_id);
                expect(result.payment_method).toEqual(paymentData.payment_method);
            });
        });
        describe('실패 케이스', () => {
            it('결제 데이터가 유효하지 않으면 결제 생성시 에러 발생', async () => {
                // given
                const paymentData = {
                    user_id: -1,
                    order_id: 1,
                    payment_method: PaymentMethod.POINT,
                };

                // when & then
                await prisma.$transaction(async (tx) => {
                    await expect(service.createPayment(paymentData, tx)).rejects.toThrow(
                        '유효하지 않은 데이터입니다.',
                    );
                });
            });
        });
        describe('동시성 테스트', () => {
            it('동시에 결제를 5개 생성하면 결제는 1개만 생성된다.', async () => {
                // given
                const paymentData = {
                    user_id: 32,
                    order_id: 14,
                    payment_method: PaymentMethod.POINT,
                };

                const promises = Array.from({ length: 5 }, () =>
                    prisma.$transaction(async (tx) => {
                        return await service.createPayment(paymentData, tx);
                    }),
                );
                const results = await Promise.allSettled(promises);

                const successResults = results.filter((result) => result.status === 'fulfilled');
                const failedResults = results.filter((result) => result.status === 'rejected');

                // then
                expect(results.length).toBe(5);
                expect(successResults.length).toBe(1);
                expect(failedResults.length).toBe(4);
            });
        });
    });

    describe('findPaymentByIdWithLock: 결제 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('결제 아이디가 유효하면 결제 조회 성공', async () => {
                // given
                const paymentId = 1;

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findPaymentByIdWithLock(paymentId, tx);
                });

                // then
                expect(result).not.toBeNull();
                expect(result?.id).toBe(paymentId);
            });
        });
        describe('실패 케이스', () => {
            it('결제 아이디가 유효하지 않으면 결제 조회시 에러 발생', async () => {
                // given
                const paymentId = -1;

                // when & then
                await expect(service.findPaymentByIdWithLock(paymentId, undefined)).rejects.toThrow(
                    '유효하지 않은 결제 ID입니다.',
                );
            });
            it('존재하지 않는 결제 아이디로 결제 조회시 에러 발생', async () => {
                // given
                const paymentId = 999;

                // when & then
                await prisma.$transaction(async (tx) => {
                    await expect(service.findPaymentByIdWithLock(paymentId, tx)).rejects.toThrow(
                        '결제 정보를 찾을 수 없습니다.',
                    );
                });
            });
        });
    });

    describe('updatePaymentStatus: 결제 상태 업데이트 테스트', () => {
        describe('성공 케이스', () => {
            it('결제 아이디가 유효하면 결제 상태 업데이트 성공', async () => {
                // given
                const paymentId = 1;
                const status = PaymentStatus.PAID;

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.updatePaymentStatus(paymentId, status, tx);
                });

                // then
                expect(result).not.toBeNull();
                expect(result?.id).toBe(paymentId);
                expect(result?.status).toBe(status);
            });
        });
        describe('실패 케이스', () => {
            it('결제 아이디가 유효하지 않으면 결제 상태 업데이트시 에러 발생', async () => {
                // given
                const paymentId = -1;
                const status = PaymentStatus.PAID;

                // when & then
                await prisma.$transaction(async (tx) => {
                    await expect(
                        service.updatePaymentStatus(paymentId, status, tx),
                    ).rejects.toThrow('유효하지 않은 결제 ID입니다.');
                });
            });
            it('결제 상태가 유효하지 않으면 결제 상태 업데이트시 에러 발생', async () => {
                // given
                const paymentId = 1;
                const status = 'INVALID' as any;

                // when & then
                await prisma.$transaction(async (tx) => {
                    await expect(
                        service.updatePaymentStatus(paymentId, status, tx),
                    ).rejects.toThrow('유효하지 않은 결제 상태입니다.');
                });
            });
        });
    });
});
