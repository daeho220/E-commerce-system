import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { PrismaService } from '../../../database/prisma.service';
import { CommonValidator } from '../../../common/common-validator';
import { PrismaModule } from '../../../database/prisma.module';
import { OrderStatus } from '../type/order-status.enum';
describe('OrderService', () => {
    let service: OrderService;
    let repository: IOrderRepository;
    let prisma: PrismaService;

    const mockOrder = {
        id: 1,
        user_id: 1,
        user_coupon_id: null,
        original_price: 10000,
        discount_price: 0,
        total_price: 10000,
        status: 'PENDING',
        created_at: new Date(),
    };

    const mockOrderDetail = {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 1,
        price_at_purchase: 10000,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [
                OrderService,
                {
                    provide: IORDER_REPOSITORY,
                    useValue: {
                        createOrder: jest.fn(),
                        createOrderDetail: jest.fn(),
                        updateOrderStatus: jest.fn(),
                        findByIdwithLock: jest.fn(),
                        findByUserIdandOrderIdwithLock: jest.fn(),
                    },
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        repository = module.get<IOrderRepository>(IORDER_REPOSITORY);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createOrder: 주문 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰을 사용하지 않고, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given

                const orderData = {
                    id: 1,
                    user_id: 1,
                    user_coupon_id: null,
                    original_price: 10000,
                    discount_price: 0,
                    total_price: 10000,
                    status: 'PENDING',
                    created_at: new Date(),
                };

                jest.spyOn(repository, 'createOrder').mockResolvedValueOnce(orderData);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.createOrder(orderData, tx);
                });

                // then
                expect(result).toEqual(orderData);
            });
            it('쿠폰을 사용하고, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const orderData = {
                    id: 1,
                    user_id: 1,
                    user_coupon_id: 1,
                    original_price: 10000,
                    discount_price: 1000,
                    total_price: 9000,
                    status: 'PENDING',
                    created_at: new Date(),
                };

                jest.spyOn(repository, 'createOrder').mockResolvedValueOnce(orderData);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.createOrder(orderData, tx);
                });

                // then
                expect(result).toEqual(orderData);
            });
        });

        describe('실패 케이스', () => {
            it('유효하지 않은 주문 데이터가 주어지면 오류를 던진다', async () => {
                // given
                const orderData = {
                    user_id: -1,
                    original_price: 1000,
                    total_price: 1000,
                    discount_price: 0,
                    user_coupon_id: -1,
                };

                // when & then
                await expect(service.createOrder(orderData, undefined)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });
        });
    });

    describe('createOrderDetail: 주문 상세 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 주문 상세 데이터가 주어지면 주문 상세를 생성한다', async () => {
                // given
                const orderDetailData = {
                    order_id: 1,
                    product_id: 1,
                    quantity: 1,
                    price_at_purchase: 10000,
                };

                jest.spyOn(repository, 'createOrderDetail').mockResolvedValueOnce(mockOrderDetail);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.createOrderDetail(orderDetailData, tx);
                });

                // then
                expect(result).toEqual(mockOrderDetail);
            });
        });

        describe('실패 케이스', () => {
            it('유효하지 않은 주문 상세 데이터가 주어지면 오류를 던진다', async () => {
                // given
                const orderDetailData = {
                    order_id: -1,
                    product_id: -1,
                    quantity: -1,
                    price_at_purchase: -1,
                };

                // when & then
                await expect(service.createOrderDetail(orderDetailData, undefined)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });
        });
    });

    describe('findByIdwithLock: 주문 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('주문id가 주어지면 주문서를 조회한다', async () => {
                // given
                const orderId = 1;

                jest.spyOn(repository, 'findByIdwithLock').mockResolvedValueOnce(mockOrder);

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findByIdwithLock(orderId, tx);
                });

                // then
                expect(result).toEqual(mockOrder);
            });
        });
        describe('실패 케이스', () => {
            it('주문id가 음수라면 오류를 던진다.', async () => {
                // given
                const orderId = -1;

                // when & then
                await expect(service.findByIdwithLock(orderId, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 ID입니다.',
                );
            });
        });
    });

    describe('findByUserIdandOrderIdwithLock: 주문 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('유저id와 주문id가 주어지면 주문서를 조회한다', async () => {
                // given
                const userId = 1;
                const orderId = 1;

                jest.spyOn(repository, 'findByUserIdandOrderIdwithLock').mockResolvedValueOnce(
                    mockOrder,
                );

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findByUserIdandOrderIdwithLock(userId, orderId, tx);
                });

                // then
                expect(result).toEqual(mockOrder);
            });
        });
        describe('실패 케이스', () => {
            it('유저id가 음수라면 오류를 던진다.', async () => {
                // given
                const userId = -1;
                const orderId = 1;

                // when & then
                await expect(
                    service.findByUserIdandOrderIdwithLock(userId, orderId, undefined),
                ).rejects.toThrow('유효하지 않은 사용자 ID입니다.');
            });
            it('주문id가 음수라면 오류를 던진다.', async () => {
                // given
                const userId = 1;
                const orderId = -1;

                // when & then
                await expect(
                    service.findByUserIdandOrderIdwithLock(userId, orderId, undefined),
                ).rejects.toThrow('유효하지 않은 주문 ID입니다.');
            });
        });
    });

    describe('updateOrderStatus: 주문 상태 업데이트 테스트', () => {
        describe('성공 케이스', () => {
            it('주문id와 상태가 주어지면 주문 상태를 업데이트한다', async () => {
                // given
                const orderId = 1;
                const status = OrderStatus.PAID;

                jest.spyOn(repository, 'updateOrderStatus').mockResolvedValueOnce({
                    ...mockOrder,
                    status: OrderStatus.PAID,
                });

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.updateOrderStatus(orderId, status, tx);
                });

                // then
                expect(result).toEqual({
                    ...mockOrder,
                    status: OrderStatus.PAID,
                });
            });
        });
        describe('실패 케이스', () => {
            it('주문 status가 유효하지 않은 값이라면 오류를 던진다.', async () => {
                // given
                const orderId = 1;
                const status = 'INVALID_STATUS' as any;

                // when & then
                await expect(service.updateOrderStatus(orderId, status, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 상태입니다.',
                );
            });
            it('주문id가 음수라면 오류를 던진다.', async () => {
                // given
                const orderId = -1;
                const status = OrderStatus.PAID;

                // when & then
                await expect(service.updateOrderStatus(orderId, status, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 ID입니다.',
                );
            });
        });
    });
});
