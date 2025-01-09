import { Test, TestingModule } from '@nestjs/testing';
import { PaymentFacade } from './payment.facade';
import { PaymentService } from '../domain/service/payment.service';
import { UserService } from '../../user/domain/service/user.service';
import { OrderService } from '../../order/domain/service/order.service';
import { PrismaService } from '../../database/prisma.service';
import { FacadeCreatePaymentDto } from './dto/facade-create-payment.dto';
import { PaymentStatus } from '../domain/dto/payment-status.enum';
import { PaymentMethod } from '../domain/dto/payment-method.enum';
import { OrderStatus } from '../../order/domain/type/order-status.enum';
import { HistoryService } from '../../history/domain/service/history.service';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
describe('PaymentFacade', () => {
    let facade: PaymentFacade;
    let paymentService: PaymentService;
    let userService: UserService;
    let orderService: OrderService;
    let historyService: HistoryService;

    const mockUser = {
        id: 1,
        user_name: 'test',
        point: 10000,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockOrder = {
        id: 1,
        user_id: 1,
        user_coupon_id: null,
        original_price: 5000,
        discount_price: 0,
        total_price: 5000,
        status: OrderStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockPayment = {
        id: 1,
        order_id: 1,
        user_id: 1,
        payment_method: PaymentMethod.POINT,
        total_price: 5000,
        status: PaymentStatus.PENDING,
        created_at: new Date(),
    };

    const mockPointHistory = {
        id: 1,
        user_id: 1,
        amount: 5000,
        change_type: PointChangeType.USE,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentFacade,
                {
                    provide: PaymentService,
                    useValue: {
                        createPayment: jest.fn(),
                        findPaymentByIdWithLock: jest.fn(),
                        updatePaymentStatus: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findById: jest.fn(),
                        useUserPoint: jest.fn(),
                    },
                },
                {
                    provide: OrderService,
                    useValue: {
                        findByIdwithLock: jest.fn(),
                        updateOrderStatus: jest.fn(),
                        findByUserIdandOrderIdwithLock: jest.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        $transaction: jest.fn((callback) => callback()),
                    },
                },
                {
                    provide: HistoryService,
                    useValue: {
                        createPointHistory: jest.fn(),
                    },
                },
            ],
        }).compile();

        facade = module.get<PaymentFacade>(PaymentFacade);
        paymentService = module.get<PaymentService>(PaymentService);
        userService = module.get<UserService>(UserService);
        orderService = module.get<OrderService>(OrderService);
        historyService = module.get<HistoryService>(HistoryService);
    });

    describe('createPayment: 결제 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('포인트로 정상적인 결제를 생성한다', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 1;
                createPaymentDto.order_id = 1;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
                jest.spyOn(orderService, 'findByUserIdandOrderIdwithLock').mockResolvedValue(
                    mockOrder,
                );
                jest.spyOn(paymentService, 'createPayment').mockResolvedValue(mockPayment);
                jest.spyOn(userService, 'useUserPoint').mockResolvedValue({
                    ...mockUser,
                    point: mockUser.point - mockOrder.total_price,
                });

                jest.spyOn(historyService, 'createPointHistory').mockResolvedValue(
                    mockPointHistory,
                );

                jest.spyOn(paymentService, 'updatePaymentStatus').mockResolvedValue({
                    ...mockPayment,
                    status: PaymentStatus.PAID,
                });
                jest.spyOn(orderService, 'updateOrderStatus').mockResolvedValue({
                    ...mockOrder,
                    status: OrderStatus.PAID,
                });
                jest.spyOn(paymentService, 'findPaymentByIdWithLock').mockResolvedValue({
                    ...mockPayment,
                    status: PaymentStatus.PAID,
                });

                // when
                const result = await facade.createPayment(createPaymentDto);

                // then
                expect(result).toBeDefined();
                expect(result.status).toBe(PaymentStatus.PAID);
                expect(result.user_id).toBe(mockUser.id);
                expect(result.order_id).toBe(mockOrder.id);
                expect(result.payment_method).toBe(PaymentMethod.POINT);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 주문인 경우 에러를 던진다', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 1;
                createPaymentDto.order_id = 9999;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                jest.spyOn(orderService, 'findByUserIdandOrderIdwithLock').mockRejectedValue(
                    new Error('주문 정보를 찾을 수 없습니다.'),
                );

                // when & then
                await expect(facade.createPayment(createPaymentDto)).rejects.toThrow(
                    '주문 정보를 찾을 수 없습니다.',
                );
            });

            it('주문 상태가 PENDING이 아닌 경우 에러를 던진다', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 1;
                createPaymentDto.order_id = 1;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
                jest.spyOn(orderService, 'findByUserIdandOrderIdwithLock').mockResolvedValue({
                    ...mockOrder,
                    status: OrderStatus.PAID,
                });

                // when & then
                await expect(facade.createPayment(createPaymentDto)).rejects.toThrow(
                    '주문서 상태가 PAID 입니다.',
                );
            });

            it('포인트가 부족한 경우 에러를 던진다', async () => {
                // given
                const createPaymentDto = new FacadeCreatePaymentDto();
                createPaymentDto.user_id = 1;
                createPaymentDto.order_id = 1;
                createPaymentDto.payment_method = PaymentMethod.POINT;

                jest.spyOn(userService, 'findById').mockResolvedValue({
                    ...mockUser,
                    point: 1000,
                });
                jest.spyOn(orderService, 'findByUserIdandOrderIdwithLock').mockResolvedValue({
                    ...mockOrder,
                    total_price: 5000,
                });
                jest.spyOn(paymentService, 'createPayment').mockResolvedValue(mockPayment);
                jest.spyOn(userService, 'useUserPoint').mockRejectedValue(
                    new Error('유저 포인트 잔고가 부족합니다.'),
                );

                // when & then
                await expect(facade.createPayment(createPaymentDto)).rejects.toThrow(
                    '유저 포인트 잔고가 부족합니다.',
                );
            });
        });
    });
});
