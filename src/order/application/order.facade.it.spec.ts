import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../order.module';
import { PrismaModule } from '../../database/prisma.module';
import { OrderFacade } from './order.facade';
import { FacadeCreateOrderDto } from './dto/facade-create-order.dto';
import { PrismaService } from '../../database/prisma.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../configs/winston.config';
import { NotFoundException } from '@nestjs/common';
describe('OrderFacade', () => {
    let service: OrderFacade;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OrderModule, PrismaModule, WinstonModule.forRoot(winstonConfig)],
        }).compile();

        service = module.get<OrderFacade>(OrderFacade);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('createOrder: 주문 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰이 있는 경우, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 2;
                createOrderDto.coupon_id = 2;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                    {
                        product_id: 2,
                        quantity: 1,
                    },
                ];

                // when
                const result = await service.createOrder(createOrderDto);

                // then
                expect(result).toBeDefined();
                expect(result.original_price).toBe(3000);
                expect(result.discount_price).toBe(600); // 3000*0.2 = 600
                expect(result.total_price).toBe(2400); // (1000 + 2000) - 3000*0.2 = 2400
            });
            it('쿠폰이 없는 경우, 정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 3;
                createOrderDto.coupon_id = null;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                    {
                        product_id: 2,
                        quantity: 1,
                    },
                ];

                // when
                const result = await service.createOrder(createOrderDto);

                // then
                expect(result).toBeDefined();
                expect(result.original_price).toBe(3000);
                expect(result.discount_price).toBe(0);
                expect(result.total_price).toBe(3000);
            });
        });

        describe('실패 케이스', () => {
            it('실제 존재하지 않는 쿠폰 아이디가 주어지면 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 2;
                createOrderDto.coupon_id = 100;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                ];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    'ID가 2인 사용자와 ID가 100인 쿠폰을 찾을 수 없습니다.',
                );
            });
            it('유저 쿠폰 상태가 AVAILABLE가 아닌 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 5;
                createOrderDto.coupon_id = 5;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                ];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    '사용할 수 없는 쿠폰입니다.',
                );
            });
            it('쿠폰 만료일이 지난 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 10;
                createOrderDto.coupon_id = 10;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                ];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    '만료된 쿠폰입니다.',
                );
            });
            it('사용자 쿠폰이 존재하지 않는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = 2;
                createOrderDto.order_items = [
                    {
                        product_id: 1,
                        quantity: 1,
                    },
                ];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    'ID가 1인 사용자와 ID가 2인 쿠폰을 찾을 수 없습니다.',
                );
            });
            it('유저가 존재하지 않는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 100;
                createOrderDto.coupon_id = 2;
                createOrderDto.order_items = [{ product_id: 1, quantity: 1 }];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    NotFoundException,
                );
            });
            it('주문 아이템이 존재하지 않는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 2;
                createOrderDto.coupon_id = 2;
                createOrderDto.order_items = [];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 주문 데이터입니다.',
                );
            });
            it('주문하려는 상품이 실제로 존재하지 않는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 2;
                createOrderDto.coupon_id = 2;
                createOrderDto.order_items = [
                    {
                        product_id: 100,
                        quantity: 1,
                    },
                ];

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    'ID가 100인 상품을 찾을 수 없습니다.',
                );
            });
        });
    });

    describe('calculateOrderPrice: 주문 가격 계산 테스트', () => {
        describe('성공 케이스', () => {
            it('유저, 쿠폰, 원래 가격이 주어지면 주문 가격을 계산한다', async () => {
                // given
                const userId = 7;
                const couponId = 7;
                const originalPrice = 3000;

                // when
                const result = await service.calculateOrderPrice(userId, couponId, originalPrice);

                // then
                expect(result).toBeDefined();
                expect(result.originalPrice).toBe(originalPrice);
                expect(result.discountPrice).toBe(600);
                expect(result.totalPrice).toBe(2400);
            });
            it('쿠폰이 없는 경우, 원래 가격이 주어지면 주문 가격을 계산한다', async () => {
                // given
                const userId = 2;
                const couponId = null;
                const originalPrice = 3000;

                // when
                const result = await service.calculateOrderPrice(userId, couponId, originalPrice);

                // then
                expect(result).toBeDefined();
                expect(result.originalPrice).toBe(originalPrice);
                expect(result.discountPrice).toBe(0);
                expect(result.totalPrice).toBe(originalPrice);
            });
        });

        describe('실패 케이스', () => {
            it('유효하지 않은 쿠폰 코드가 주어지면 에러를 던진다', async () => {
                // given
                const userId = 2;
                const couponId = 100;
                const originalPrice = 3000;

                // when & then
                await expect(
                    service.calculateOrderPrice(userId, couponId, originalPrice, undefined),
                ).rejects.toThrow('ID가 2인 사용자와 ID가 100인 쿠폰을 찾을 수 없습니다.');
            });
        });
    });

    describe('주문 동시성 테스트', () => {
        it('동일한 쿠폰으로 5개의 주문을 동시에 요청하면 1개의 주문만 성공해야 한다', async () => {
            // given
            const createOrderDto = new FacadeCreateOrderDto();
            createOrderDto.user_id = 3;
            createOrderDto.coupon_id = 3;
            createOrderDto.order_items = [
                {
                    product_id: 9,
                    quantity: 1,
                },
                {
                    product_id: 10,
                    quantity: 1,
                },
            ];

            const promises = Array(5)
                .fill(null)
                .map(() => service.createOrder({ ...createOrderDto }));

            // when
            const results = await Promise.allSettled(promises);

            // then
            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failCount = results.filter((result) => result.status === 'rejected').length;

            expect(successCount).toBe(1);
            expect(failCount).toBe(4);

            // 실패한 주문들의 에러 메시지 확인
            const failedResults = results.filter(
                (result) => result.status === 'rejected',
            ) as PromiseRejectedResult[];
            failedResults.forEach((result) => {
                expect(result.reason.message).toBe('사용할 수 없는 쿠폰입니다.');
            });

            // 상품 재고 확인 : 1개의 주문만 성공했기에 재고는 1개 줄어들어야한다.
            const product9 = await prisma.product.findUnique({
                where: { id: 9 },
            });
            expect(product9?.stock).toBe(99);

            const product10 = await prisma.product.findUnique({
                where: { id: 10 },
            });
            expect(product10?.stock).toBe(99);
        });
        it('동일한 5개의 주문을 동시에 요청 및 상품이 존재하지 않는 경우 쿠폰 상태가 업데이트 되지 않아야 한다', async () => {
            // given
            const createOrderDto = new FacadeCreateOrderDto();
            createOrderDto.user_id = 4;
            createOrderDto.coupon_id = 4;
            createOrderDto.order_items = [
                { product_id: 999, quantity: 1 },
                { product_id: 998, quantity: 1 },
            ];

            const promises = Array(5)
                .fill(null)
                .map(() => service.createOrder({ ...createOrderDto }));

            // when
            const results = await Promise.allSettled(promises);

            // then
            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failCount = results.filter((result) => result.status === 'rejected').length;

            expect(successCount).toBe(0);
            expect(failCount).toBe(5);

            // 쿠폰 상태 검증
            const userCoupon = await prisma.user_coupon.findUnique({
                where: { id: 4 },
            });
            expect(userCoupon?.status).toBe('AVAILABLE');
        });
    });
});
