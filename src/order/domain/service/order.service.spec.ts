import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';

describe('OrderService', () => {
    let service: OrderService;
    let repository: IOrderRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: IORDER_REPOSITORY,
                    useValue: {
                        createOrder: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        repository = module.get<IOrderRepository>(IORDER_REPOSITORY);
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
                const result = await service.createOrder(orderData, undefined);

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
                const result = await service.createOrder(orderData, undefined);

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
});
