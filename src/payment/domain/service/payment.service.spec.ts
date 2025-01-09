import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { IPAYMENT_REPOSITORY, IPaymentRepository } from '../payment.repository.interface';
import { payment as PrismaPayment } from '@prisma/client';
import { PaymentMethod } from '../dto/payment-method.enum';
import { CommonValidator } from '../../../common/common-validator';
import { PrismaService } from '../../../database/prisma.service';
import { PrismaModule } from '../../../database/prisma.module';
import { PaymentStatus } from '../dto/payment-status.enum';
describe('PaymentService', () => {
    let service: PaymentService;
    let repository: any;
    let commonValidator: CommonValidator;
    let prisma: PrismaService;
    const mockPayment: PrismaPayment = {
        id: 1,
        order_id: 1,
        user_id: 1,
        payment_method: PaymentMethod.POINT,
        status: PaymentStatus.PENDING,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const mockRepository = {
            createPayment: jest.fn(),
            findPaymentByIdWithLock: jest.fn(),
            updatePaymentStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [
                PaymentService,
                {
                    provide: IPAYMENT_REPOSITORY,
                    useValue: mockRepository,
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        repository = module.get<IPaymentRepository>(IPAYMENT_REPOSITORY);
        commonValidator = module.get<CommonValidator>(CommonValidator);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createPayment: 결제 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 결제 데이터가 주어지면 결제를 생성한다', async () => {
                // given
                const paymentData = {
                    order_id: 1,
                    user_id: 1,
                    payment_method: PaymentMethod.POINT,
                };

                repository.createPayment.mockResolvedValue(mockPayment);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.createPayment(paymentData, tx);
                });

                // then
                expect(result).toEqual(mockPayment);
            });
        });
        describe('실패 케이스', () => {
            it('payment_method가 유효하지 않으면 결제 생성시 에러 발생', async () => {
                // given
                const paymentData = {
                    order_id: 1,
                    user_id: 1,
                    payment_method: 'Nothing',
                };

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.createPayment(paymentData, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 데이터입니다.');
            });
            it('user_id가 양수가 아니면 결제 생성시 에러 발생', async () => {
                // given
                const paymentData = {
                    order_id: 1,
                    user_id: -1,
                    payment_method: PaymentMethod.POINT,
                };

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.createPayment(paymentData, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 데이터입니다.');
            });
            it('order_id가 양수가 아니면 결제 생성시 에러 발생', async () => {
                // given
                const paymentData = {
                    order_id: -1,
                    user_id: 1,
                    payment_method: PaymentMethod.POINT,
                };

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.createPayment(paymentData, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 데이터입니다.');
            });
        });
    });

    describe('findPaymentByIdWithLock: 결제 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('결제 아이디가 양수이면 결제 조회시 결제 데이터를 반환한다', async () => {
                // given
                const paymentId = 1;
                repository.findPaymentByIdWithLock.mockResolvedValue(mockPayment);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findPaymentByIdWithLock(paymentId, tx);
                });

                // then
                expect(result).toEqual(mockPayment);
            });
        });
        describe('실패 케이스', () => {
            it('결제 아이디가 음수이면 결제 조회시 에러 발생', async () => {
                // given
                const paymentId = -1;

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.findPaymentByIdWithLock(paymentId, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 결제 ID입니다.');
            });
            it('결제 아이디가 0이면 결제 조회시 에러 발생', async () => {
                // given
                const paymentId = 0;

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.findPaymentByIdWithLock(paymentId, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 결제 ID입니다.');
            });
        });
    });

    describe('updatePaymentStatus: 결제 상태 업데이트 테스트', () => {
        describe('성공 케이스', () => {
            it('결제 아이디가 양수, 결제 상태가 유효하면 결제 상태 업데이트시 결제 데이터를 반환한다', async () => {
                // given
                const paymentId = 1;
                const status = PaymentStatus.PAID;
                repository.updatePaymentStatus.mockResolvedValue({
                    ...mockPayment,
                    status: PaymentStatus.PAID,
                });

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.updatePaymentStatus(paymentId, status, tx);
                });

                // then
                expect(result).toEqual({
                    ...mockPayment,
                    status: PaymentStatus.PAID,
                });
            });
        });
        describe('실패 케이스', () => {
            it('결제 아이디가 음수이면 결제 상태 업데이트시 에러 발생', async () => {
                // given
                const paymentId = -1;
                const status = PaymentStatus.PAID;

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.updatePaymentStatus(paymentId, status, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 결제 ID입니다.');
            });
            it('결제 상태가 유효하지 않으면 결제 상태 업데이트시 에러 발생', async () => {
                // given
                const paymentId = 1;
                const status = 'Nothing' as any;

                // when & then
                await expect(
                    prisma.$transaction(async (tx) => {
                        return await service.updatePaymentStatus(paymentId, status, tx);
                    }),
                ).rejects.toThrow('유효하지 않은 결제 상태입니다.');
            });
        });
    });
});
