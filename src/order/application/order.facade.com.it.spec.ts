import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../order.module';
import { PrismaModule } from '../../database/prisma.module';
import { OrderFacade } from './order.facade';
import { FacadeCreateOrderDto } from './dto/facade-create-order.dto';
import { PrismaService } from '../../database/prisma.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../configs/winston.config';
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

    describe('주문 동시성 테스트', () => {
        describe('동일한 쿠폰으로 5개의 주문을 동시에 요청하면 1개의 주문만 성공해야 한다', () => {
            it('비관적 락', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 19;
                createOrderDto.coupon_id = 15;
                createOrderDto.order_items = [
                    {
                        product_id: 21,
                        quantity: 1,
                    },
                    {
                        product_id: 22,
                        quantity: 1,
                    },
                ];

                const promises = Array(5)
                    .fill(null)
                    .map(() => service.createOrder({ ...createOrderDto }));

                // when
                const results = await Promise.allSettled(promises);

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
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
                const product21 = await prisma.product.findUnique({
                    where: { id: 21 },
                });
                expect(product21?.stock).toBe(3);

                const product22 = await prisma.product.findUnique({
                    where: { id: 22 },
                });
                expect(product22?.stock).toBe(99);
            });
            it('분산 락', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 20;
                createOrderDto.coupon_id = 15;
                createOrderDto.order_items = [
                    {
                        product_id: 19,
                        quantity: 1,
                    },
                    {
                        product_id: 20,
                        quantity: 1,
                    },
                ];

                const promises = Array(5)
                    .fill(null)
                    .map(() => service.createOrderWithDistributedLock({ ...createOrderDto }));

                // when
                const results = await Promise.allSettled(promises);

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failCount = results.filter((result) => result.status === 'rejected').length;

                expect(successCount).toBe(1);
                expect(failCount).toBe(4);

                // 실패한 주문들의 에러 메시지 확인
                const failedResults = results.filter(
                    (result) => result.status === 'rejected',
                ) as PromiseRejectedResult[];
                failedResults.forEach((result) => {
                    expect(result.reason.message).toBe('주문 생성에 실패했습니다.');
                });

                // 상품 재고 확인 : 1개의 주문만 성공했기에 재고는 1개 줄어들어야한다.
                const product19 = await prisma.product.findUnique({
                    where: { id: 19 },
                });
                expect(product19?.stock).toBe(99);

                const product20 = await prisma.product.findUnique({
                    where: { id: 20 },
                });
                expect(product20?.stock).toBe(99);
            });
        });
        describe('10명의 유저가 재고가 4개인 상품을 주문하면 4명의 유저만 주문이 성공해야한다.', () => {
            it('비관적 락', async () => {
                // given
                const userIds = Array.from({ length: 10 }, (_, i) => i + 21);
                const createOrderDtos = userIds.map((userId) => ({
                    user_id: userId,
                    order_items: [{ product_id: 24, quantity: 1 }],
                }));
                // when
                const results = await Promise.allSettled(
                    createOrderDtos.map((createOrderDto) => service.createOrder(createOrderDto)),
                );

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failCount = results.filter((result) => result.status === 'rejected').length;

                expect(successCount).toBe(4);
                expect(failCount).toBe(6);

                // 실패한 주문들의 에러 메시지 확인
                const failedResults = results.filter(
                    (result) => result.status === 'rejected',
                ) as PromiseRejectedResult[];
                failedResults.forEach((result) => {
                    expect(result.reason.message).toBe('판매하지 않는 상품입니다.');
                });

                const product24 = await prisma.product.findUnique({
                    where: { id: 24 },
                });
                expect(product24?.stock).toBe(0);
            });
            it('분산 락', async () => {
                // given
                const userIds = Array.from({ length: 10 }, (_, i) => i + 21);
                const createOrderDtos = userIds.map((userId) => ({
                    user_id: userId,
                    order_items: [{ product_id: 23, quantity: 1 }],
                }));
                // when
                const results = await Promise.allSettled(
                    createOrderDtos.map((createOrderDto) =>
                        service.createOrderWithDistributedLock(createOrderDto),
                    ),
                );

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failCount = results.filter((result) => result.status === 'rejected').length;

                expect(successCount).toBe(4);
                expect(failCount).toBe(6);

                // 실패한 주문들의 에러 메시지 확인
                const failedResults = results.filter(
                    (result) => result.status === 'rejected',
                ) as PromiseRejectedResult[];
                failedResults.forEach((result) => {
                    expect(result.reason.message).toBe('판매하지 않는 상품입니다.');
                });

                const product23 = await prisma.product.findUnique({
                    where: { id: 23 },
                });
                expect(product23?.stock).toBe(0);
            });
        });
    });
});
