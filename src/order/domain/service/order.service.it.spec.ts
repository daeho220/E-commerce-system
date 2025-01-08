import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../../order.module';
import { PrismaModule } from '../../../database/prisma.module';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
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
            it('정상적인 주문 데이터가 주어지면 주문을 생성한다', async () => {
                // given
                const createOrderDto = new CreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.original_price = 10000;
                createOrderDto.total_price = 10000;
                createOrderDto.discount_price = 0;
                createOrderDto.user_coupon_id = null;

                // when
                const result: PrismaOrder = await service.createOrder(createOrderDto);

                // then
                expect(result).toBeDefined();
                expect(result.user_id).toBe(createOrderDto.user_id);
                expect(result.original_price).toBe(createOrderDto.original_price);
                expect(result.total_price).toBe(createOrderDto.total_price);
                expect(result.discount_price).toBe(createOrderDto.discount_price);
                expect(result.user_coupon_id).toBe(createOrderDto.user_coupon_id);
            });
        });

        describe('실패 케이스', () => {
            it('쿠폰 ID가 음수로 주어지면 오류를 던진다', async () => {
                // given
                const createOrderDto = new CreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.original_price = 10000;
                createOrderDto.total_price = 10000;
                createOrderDto.discount_price = 0;
                createOrderDto.user_coupon_id = -1;

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });

            it('dto에 필요한 데이터가 없으면 오류를 던진다', async () => {
                // given
                const createOrderDto = new CreateOrderDto();

                //origianl_price가 없는 상태
                createOrderDto.user_id = 1;
                createOrderDto.total_price = 10000;
                createOrderDto.discount_price = 0;
                createOrderDto.user_coupon_id = null;

                // when & then
                await expect(service.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 데이터입니다.',
                );
            });
        });
    });
});
