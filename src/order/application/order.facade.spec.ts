import { Test, TestingModule } from '@nestjs/testing';
import { OrderFacade } from './order.facade';
import { UserService } from '../../user/domain/service/user.service';
import { ProductService } from '../../product/domain/service/product.service';
import { CouponService } from '../../coupon/domain/service/coupon.service';
import { OrderService } from '../domain/service/order.service';
import { PrismaService } from '../../database/prisma.service';
import { FacadeCreateOrderDto } from './dto/facade-create-order.dto';

describe('OrderFacade', () => {
    let facade: OrderFacade;
    let userService: jest.Mocked<UserService>;
    let productService: jest.Mocked<ProductService>;
    let couponService: jest.Mocked<CouponService>;
    let orderService: jest.Mocked<OrderService>;

    const mockProduct = {
        id: 1,
        price: 1000,
        stock: 10,
        created_at: new Date(),
        updated_at: new Date(),
        product_name: 'test',
        status: true,
    };

    const mockUser = {
        id: 1,
        user_name: 'test',
        point: 1000,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockOrder = {
        id: 1,
        user_id: 1,
        coupon_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'PENDING',
        user_coupon_id: null,
        original_price: 1000,
        discount_price: 0,
        total_price: 1000,
    };

    const mockOrderDetail = {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 2,
        price_at_purchase: 1000,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockUserCoupon = {
        id: 1,
        user_id: 1,
        coupon_id: 1,
        issue_date: new Date(),
        expiration_date: new Date(),
        status: 'AVAILABLE',
    };

    const mockCoupon = {
        id: 1,
        discount_amount: 10,
        discount_type: 'PERCENTAGE',
        created_at: new Date(),
        updated_at: new Date(),
        code: 'test',
        expiration_type: 'ABSOLUTE',
        expiration_days: null,
        absolute_expiration_date: new Date(),
        max_count: 1,
        issue_start_date: new Date(),
        issue_end_date: new Date(),
        current_count: 0,
    };

    beforeEach(async () => {
        const mockUserService = {
            findByIdwithLock: jest.fn(),
        };
        const mockProductService = {
            findByIdwithLock: jest.fn(),
            decreaseStock: jest.fn(),
        };
        const mockCouponService = {
            findUserCouponByUserIdAndCouponId: jest.fn(),
            validateCoupon: jest.fn(),
            findCouponById: jest.fn(),
            calculateAllPrice: jest.fn(),
        };
        const mockOrderService = {
            createOrder: jest.fn(),
            createOrderDetail: jest.fn(),
        };
        const mockPrismaService = {
            $transaction: jest.fn((callback) => callback()),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderFacade,
                { provide: UserService, useValue: mockUserService },
                { provide: ProductService, useValue: mockProductService },
                { provide: CouponService, useValue: mockCouponService },
                { provide: OrderService, useValue: mockOrderService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        facade = module.get<OrderFacade>(OrderFacade);
        userService = module.get(UserService);
        productService = module.get(ProductService);
        couponService = module.get(CouponService);
        orderService = module.get(OrderService);
    });

    describe('createOrder: 주문 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰을 사용하지 않고 정상적인 주문을 생성한다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = null as any;
                createOrderDto.order_items = [{ product_id: 1, quantity: 2 }];

                const mockProduct = {
                    id: 1,
                    price: 1000,
                    stock: 10,
                    created_at: new Date(),
                    updated_at: new Date(),
                    product_name: 'test',
                    status: true,
                };

                const mockUser = {
                    id: 1,
                    user_name: 'test',
                    point: 1000,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                const mockOrder = {
                    id: 1,
                    user_id: 1,
                    coupon_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 'PENDING',
                    user_coupon_id: null,
                    original_price: 1000,
                    discount_price: 0,
                    total_price: 1000,
                };

                const mockOrderDetail = {
                    id: 1,
                    order_id: 1,
                    product_id: 1,
                    quantity: 2,
                    price_at_purchase: 1000,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                userService.findByIdwithLock.mockResolvedValue(mockUser);
                productService.findByIdwithLock.mockResolvedValue(mockProduct);
                productService.decreaseStock.mockResolvedValue({ ...mockProduct, stock: 8 });
                orderService.createOrder.mockResolvedValue(mockOrder);
                orderService.createOrderDetail.mockResolvedValue(mockOrderDetail);

                // when
                const result = await facade.createOrder(createOrderDto);

                // then
                expect(result).toEqual(mockOrder);
            });

            it('쿠폰을 사용하여 정상적인 주문을 생성한다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = 1;
                createOrderDto.order_items = [{ product_id: 1, quantity: 2 }];

                userService.findByIdwithLock.mockResolvedValue(mockUser);
                productService.findByIdwithLock.mockResolvedValue(mockProduct);
                productService.decreaseStock.mockResolvedValue({ ...mockProduct, stock: 8 });
                couponService.findUserCouponByUserIdAndCouponId.mockResolvedValue(mockUserCoupon);
                couponService.findCouponById.mockResolvedValue(mockCoupon);
                couponService.calculateAllPrice.mockResolvedValue({
                    originalPrice: 2000,
                    discountPrice: 200,
                    totalPrice: 1800,
                });
                orderService.createOrder.mockResolvedValue(mockOrder);
                orderService.createOrderDetail.mockResolvedValue(mockOrderDetail);

                // when
                const result = await facade.createOrder(createOrderDto);

                // then
                expect(result).toEqual(mockOrder);
            });
        });

        describe('실패 케이스', () => {
            it('재고가 부족한 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = 1;
                createOrderDto.order_items = [
                    { product_id: 1, quantity: 15 }, // mockProduct의 재고 10개 보다 많은 수량
                ];

                userService.findByIdwithLock.mockResolvedValue(mockUser);
                productService.findByIdwithLock.mockResolvedValue(mockProduct);

                // when & then
                await expect(facade.createOrder(createOrderDto)).rejects.toThrow(
                    '재고가 부족합니다.',
                );
                expect(productService.findByIdwithLock).toHaveBeenCalledWith(1);
                expect(productService.decreaseStock).not.toHaveBeenCalled();
                expect(orderService.createOrder).not.toHaveBeenCalled();
                expect(orderService.createOrderDetail).not.toHaveBeenCalled();
            });

            it('존재하지 않는 사용자인 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 999;

                userService.findByIdwithLock.mockRejectedValue(
                    new Error('유저 정보를 찾을 수 없습니다.'),
                );

                // when & then
                await expect(facade.createOrder(createOrderDto)).rejects.toThrow();
            });

            it('주문 상품이 비어있는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = null as any;
                createOrderDto.order_items = [];

                // when & then
                await expect(facade.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 주문 데이터입니다.',
                );
            });

            it('상품 수량이 0 이하인 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.user_id = 1;
                createOrderDto.coupon_id = null as any;
                createOrderDto.order_items = [{ product_id: 1, quantity: 0 }];

                // when & then
                await expect(facade.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 주문 데이터입니다.',
                );
            });

            it('user_id가 없는 경우 에러를 던진다', async () => {
                // given
                const createOrderDto = new FacadeCreateOrderDto();
                createOrderDto.coupon_id = null as any;
                createOrderDto.order_items = [{ product_id: 1, quantity: 1 }];

                // when & then
                await expect(facade.createOrder(createOrderDto)).rejects.toThrow(
                    '유효하지 않은 주문 데이터입니다.',
                );
            });
        });
    });

    describe('calculateOrderPrice: 주문 가격 계산 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰이 없는 경우 원래 가격을 그대로 반환한다', async () => {
                // given
                const userId = 1;
                const couponId = null;
                const originalPrice = 10000;

                // when
                const result = await facade.calculateOrderPrice(userId, couponId, originalPrice);

                // then
                expect(result).toEqual({
                    user_coupon_id: null,
                    originalPrice: 10000,
                    discountPrice: 0,
                    totalPrice: 10000,
                });
            });

            it('퍼센트 쿠폰을 사용하는 경우 할인된 가격을 계산한다', async () => {
                // given
                const userId = 1;
                const couponId = 1;
                const originalPrice = 10000;

                couponService.findUserCouponByUserIdAndCouponId.mockResolvedValue(mockUserCoupon);
                couponService.validateCoupon.mockResolvedValue(void 0);
                couponService.findCouponById.mockResolvedValue(mockCoupon);
                couponService.calculateAllPrice.mockResolvedValue({
                    originalPrice: 10000,
                    discountPrice: 1000,
                    totalPrice: 9000,
                });

                // when
                const result = await facade.calculateOrderPrice(userId, couponId, originalPrice);

                // then
                expect(result).toEqual({
                    user_coupon_id: mockUserCoupon.id,
                    originalPrice: 10000,
                    discountPrice: 1000,
                    totalPrice: 9000,
                });
            });

            it('정액 쿠폰을 사용하는 경우 할인된 가격을 계산한다', async () => {
                // given
                const userId = 1;
                const couponId = 1;
                const originalPrice = 10000;

                couponService.findUserCouponByUserIdAndCouponId.mockResolvedValue(mockUserCoupon);
                couponService.validateCoupon.mockResolvedValue(undefined);
                couponService.findCouponById.mockResolvedValue({
                    ...mockCoupon,
                    discount_type: 'FIXED',
                    discount_amount: 1000,
                });
                couponService.calculateAllPrice.mockResolvedValue({
                    originalPrice: 10000,
                    discountPrice: 1000,
                    totalPrice: 9000,
                });

                // when
                const result = await facade.calculateOrderPrice(userId, couponId, originalPrice);

                // then
                expect(result).toEqual({
                    user_coupon_id: mockUserCoupon.id,
                    originalPrice: 10000,
                    discountPrice: 1000,
                    totalPrice: 9000,
                });
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 쿠폰인 경우 에러를 던진다', async () => {
                // given
                const userId = 1;
                const couponId = 999;
                const originalPrice = 10000;

                couponService.findUserCouponByUserIdAndCouponId.mockRejectedValue(
                    new Error('사용자 쿠폰 정보를 찾을 수 없습니다.'),
                );

                // when & then
                await expect(
                    facade.calculateOrderPrice(userId, couponId, originalPrice),
                ).rejects.toThrow('사용자 쿠폰 정보를 찾을 수 없습니다.');
            });

            it('쿠폰 상태가 AVAILABLE이 아닌 경우 에러를 던진다', async () => {
                // given
                const userId = 1;
                const couponId = 1;
                const originalPrice = 10000;

                couponService.findUserCouponByUserIdAndCouponId.mockResolvedValue({
                    ...mockUserCoupon,
                    status: 'EXPIRED',
                });
                couponService.validateCoupon.mockRejectedValue(new Error('만료된 쿠폰입니다.'));

                // when & then
                await expect(
                    facade.calculateOrderPrice(userId, couponId, originalPrice),
                ).rejects.toThrow('만료된 쿠폰입니다.');
            });

            it('쿠폰의 할인 타입이 유효하지 않은 경우 에러를 던진다', async () => {
                // given
                const userId = 1;
                const couponId = 1;
                const originalPrice = 10000;

                couponService.findUserCouponByUserIdAndCouponId.mockResolvedValue(mockUserCoupon);
                couponService.validateCoupon.mockResolvedValue(void 0);
                couponService.findCouponById.mockResolvedValue({
                    ...mockCoupon,
                    discount_type: 'INVALID',
                });

                // when & then
                await expect(
                    facade.calculateOrderPrice(userId, couponId, originalPrice),
                ).rejects.toThrow('유효하지 않은 쿠폰입니다.');
            });
        });
    });
});
