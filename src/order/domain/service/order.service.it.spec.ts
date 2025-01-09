import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../../order.module';
import { PrismaModule } from '../../../database/prisma.module';
import { OrderService } from './order.service';
import { order as PrismaOrder } from '@prisma/client';

describe('OrderService', () => {
    let service: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OrderModule, PrismaModule],
        }).compile();

        service = module.get<OrderService>(OrderService);
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
});
