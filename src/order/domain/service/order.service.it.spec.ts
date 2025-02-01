import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../../order.module';
import { PrismaModule } from '../../../database/prisma.module';
import { OrderService } from './order.service';
import { order as PrismaOrder } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { OrderStatus } from '../type/order-status.enum';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../../configs/winston.config';

describe('OrderService', () => {
    let service: OrderService;
    let prisma: PrismaService;
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OrderModule, PrismaModule, WinstonModule.forRoot(winstonConfig)],
        }).compile();

        service = module.get<OrderService>(OrderService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createOrder: 주문 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰을 사용하지 않고, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const orderData = {
                    user_id: 1,
                    original_price: 10000,
                    total_price: 10000,
                    discount_price: 0,
                    user_coupon_id: null,
                };

                // when
                const result: PrismaOrder = await service.createOrder(orderData, undefined);

                // then
                expect(result).toBeDefined();
                expect(result.user_id).toBe(orderData.user_id);
                expect(result.original_price).toBe(orderData.original_price);
                expect(result.discount_price).toBe(orderData.discount_price);
                expect(result.total_price).toBe(orderData.total_price);
                expect(result.user_coupon_id).toBe(orderData.user_coupon_id);
            });
            it('쿠폰을 사용하고, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const orderData = {
                    user_id: 1,
                    original_price: 10000,
                    total_price: 9000,
                    discount_price: 1000,
                    user_coupon_id: 1,
                };

                // when
                const result: PrismaOrder = await service.createOrder(orderData, undefined);

                // then
                expect(result).toBeDefined();
                expect(result.user_coupon_id).toBe(orderData.user_coupon_id);
                expect(result.original_price).toBe(orderData.original_price);
                expect(result.discount_price).toBe(orderData.discount_price);
                expect(result.total_price).toBe(orderData.total_price);
            });
        });

        describe('실패 케이스', () => {
            it('쿠폰 ID가 음수로 주어지면 오류를 던진다', async () => {
                // given
                const orderData = {
                    user_id: 1,
                    original_price: 10000,
                    total_price: 10000,
                    discount_price: 0,
                    user_coupon_id: -1,
                };

                // when & then
                await expect(service.createOrder(orderData, undefined)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });

            it('dto에 필요한 데이터가 없으면 오류를 던진다', async () => {
                // given
                const orderData = {
                    user_id: 1,
                    total_price: 10000,
                    discount_price: 0,
                    user_coupon_id: null,
                } as any;

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
                    product_id: 1,
                    quantity: 1,
                    price_at_purchase: 1000,
                    order_id: 1,
                };

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.createOrderDetail(orderDetailData, tx);
                });

                // then
                expect(result).toBeDefined();
                expect(result.product_id).toBe(orderDetailData.product_id);
                expect(result.quantity).toBe(orderDetailData.quantity);
                expect(result.price_at_purchase).toBe(orderDetailData.price_at_purchase);
                expect(result.order_id).toBe(orderDetailData.order_id);
            });
        });
        describe('실패 케이스', () => {
            it('주문 상세 데이터가 유효하지 않으면 오류를 던진다', async () => {
                // given
                const orderDetailData = {
                    product_id: 1,
                } as any;

                // when & then
                await expect(service.createOrderDetail(orderDetailData, undefined)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });
        });
    });

    describe('findByIdwithLock: 주문 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('주문 ID가 정상적으로 주어지면 주문을 조회한다', async () => {
                // given
                const orderId = 1;

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findByIdwithLock(orderId, tx);
                });

                // then
                expect(result.id).toBe(orderId);
            });
        });
        describe('실패 케이스', () => {
            it('주문 ID가 음수로 주어지면 오류를 던진다', async () => {
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
            it('유저 ID와 주문 ID가 정상적으로 주어지면 주문을 조회한다', async () => {
                // given
                const userId = 1;
                const orderId = 1;

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.findByUserIdandOrderIdwithLock(userId, orderId, tx);
                });

                // then
                expect(result).toBeDefined();
                expect(result.id).toBe(orderId);
            });
        });
        describe('실패 케이스', () => {
            it('유저 ID가 음수로 주어지면 오류를 던진다', async () => {
                // given
                const userId = -1;
                const orderId = 1;

                // when & then
                await expect(
                    service.findByUserIdandOrderIdwithLock(userId, orderId, undefined),
                ).rejects.toThrow('유효하지 않은 사용자 ID입니다.');
            });
            it('주문 ID가 음수로 주어지면 오류를 던진다', async () => {
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
            it('주문 ID와 상태가 정상적으로 주어지면 주문 상태를 업데이트한다', async () => {
                // given
                const orderId = 1;
                const status = OrderStatus.PAID;

                // when
                const result = await prisma.$transaction(async (tx) => {
                    return await service.updateOrderStatus(orderId, status, tx);
                });

                // then
                expect(result.status).toBe(status);
            });
        });
        describe('실패 케이스', () => {
            it('주문 ID가 음수로 주어지면 오류를 던진다', async () => {
                // given
                const orderId = -1;
                const status = OrderStatus.PAID;

                // when & then
                await expect(service.updateOrderStatus(orderId, status, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 ID입니다.',
                );
            });
            it('상태가 유효하지 않으면 오류를 던진다', async () => {
                // given
                const orderId = 1;
                const status = 'INVALID' as any;

                // when & then
                await expect(service.updateOrderStatus(orderId, status, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 상태입니다.',
                );
            });
        });
    });

    describe('findById: 주문 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('주문 ID가 정상적으로 주어지면 주문을 조회한다', async () => {
                // given
                const orderId = 1;

                // when
                const result = await service.findById(orderId, undefined);

                // then
                expect(result).toBeDefined();
                expect(result.id).toBe(orderId);
            });
        });
        describe('실패 케이스', () => {
            it('주문 ID가 음수로 주어지면 오류를 던진다', async () => {
                // given
                const orderId = -1;

                // when & then
                await expect(service.findById(orderId, undefined)).rejects.toThrow(
                    '유효하지 않은 주문 ID입니다.',
                );
            });
        });
    });
});
