import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { IOrderRepository, IORDER_REPOSITORY } from '../order.repository.interface';
import { order as PrismaOrder } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderMapper } from '../mappers/OrderDtoToPrisma.mapper';
import { validate } from 'class-validator';

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
                const createOrderDto: CreateOrderDto = {
                    user_id: 1,
                    original_price: 10000,
                    total_price: 10000,
                    discount_price: 0,
                    user_coupon_id: 1,
                };

                const orderData: PrismaOrder = OrderMapper.toPrismaOrder(createOrderDto);

                jest.spyOn(repository, 'createOrder').mockResolvedValueOnce(orderData);

                // when
                const result = await service.createOrder(createOrderDto);

                // then
                expect(result).toEqual(orderData);
                expect(repository.createOrder).toHaveBeenCalledWith(
                    expect.objectContaining({
                        user_id: createOrderDto.user_id,
                        original_price: expect.any(Number),
                        discount_price: 0,
                        total_price: expect.any(Number),
                    }),
                );
            });
        });

        describe('실패 케이스', () => {
            it('유효하지 않은 주문 데이터가 주어지면 오류를 던진다', async () => {
                // given
                const createOrderDto = new CreateOrderDto();
                createOrderDto.user_id = -1;
                createOrderDto.original_price = 1000;
                createOrderDto.total_price = 1000;
                createOrderDto.discount_price = 0;
                createOrderDto.user_coupon_id = -1;

                const errors = await validate(createOrderDto);
                expect(errors.length).toBeGreaterThan(0);
            });
        });
    });
});
