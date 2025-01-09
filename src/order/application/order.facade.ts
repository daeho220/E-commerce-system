import { Injectable } from '@nestjs/common';
import { FacadeCreateOrderDto } from './dto/facade-create-order.dto';
import { OrderService } from '../domain/service/order.service';
import { order as PrismaOrder, order_detail as PrismaOrderDetail, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UserService } from '../../user/domain/service/user.service';
import { ProductService } from '../../product/domain/service/product.service';
import { CouponService } from '../../coupon/domain/service/coupon.service';
import { OrderPriceInfo } from './type/orderPrices.type';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CouponStatus } from '../../coupon/domain/type/couponStatus.enum';
@Injectable()
export class OrderFacade {
    constructor(
        private readonly userService: UserService,
        private readonly productService: ProductService,
        private readonly couponService: CouponService,
        private readonly orderService: OrderService,
        private readonly prisma: PrismaService,
    ) {}

    // 주문 생성
    async createOrder(dto: FacadeCreateOrderDto): Promise<PrismaOrder> {
        const facadeCreateOrderDto = plainToInstance(FacadeCreateOrderDto, dto);

        const errors = await validate(facadeCreateOrderDto);
        if (errors.length > 0) {
            throw new Error('유효하지 않은 주문 데이터입니다.');
        }
        return await this.prisma.$transaction(async (tx) => {
            try {
                // 사용자 조회
                await this.userService.findByIdwithLock(facadeCreateOrderDto.user_id, tx);

                // 상품 조회
                const products = new Map<number, any>();
                let originalPrice = 0;
                for (const product of facadeCreateOrderDto.order_items) {
                    const productInfo = await this.productService.findByIdwithLock(
                        product.product_id,
                        tx,
                    );

                    // 상품 상태 검증
                    if (!productInfo.status) {
                        throw new Error('판매하지 않는 상품입니다.');
                    }

                    // 재고 확인
                    if (product.quantity > productInfo.stock) {
                        throw new Error('재고가 부족합니다.');
                    }

                    // 할인 전 가격 계산
                    originalPrice += productInfo.price * product.quantity;

                    // 재고 감소
                    const newProductInfo = await this.productService.decreaseStock(
                        product.product_id,
                        product.quantity,
                        tx,
                    );

                    products.set(product.product_id, newProductInfo);
                }

                // 쿠폰 적용 및 가격 계산
                const priceInfo: OrderPriceInfo = await this.calculateOrderPrice(
                    facadeCreateOrderDto.user_id,
                    facadeCreateOrderDto.coupon_id,
                    originalPrice,
                    tx,
                );

                // 주문 생성
                const orderData: Omit<PrismaOrder, 'id' | 'created_at' | 'status'> = {
                    user_id: facadeCreateOrderDto.user_id,
                    user_coupon_id: priceInfo.user_coupon_id,
                    original_price: priceInfo.originalPrice,
                    discount_price: priceInfo.discountPrice,
                    total_price: priceInfo.totalPrice,
                };
                const order = await this.orderService.createOrder(orderData, tx);

                // 주문 생성 후 주문 디테일 생성
                for (const orderItem of facadeCreateOrderDto.order_items) {
                    const priceAtPurchase =
                        products.get(orderItem.product_id).price * orderItem.quantity;

                    const orderDetailData: Omit<PrismaOrderDetail, 'id'> = {
                        product_id: orderItem.product_id,
                        quantity: orderItem.quantity,
                        price_at_purchase: priceAtPurchase,
                        order_id: order.id,
                    };

                    await this.orderService.createOrderDetail(orderDetailData, tx);
                }

                return order;
            } catch (error) {
                throw new Error(`주문 처리 중 에러 발생: ${error}`);
            }
        });
    }

    async calculateOrderPrice(
        userId: number,
        couponId: number | null,
        originalPrice: number,
        tx?: Prisma.TransactionClient,
    ): Promise<OrderPriceInfo> {
        // 쿠폰이 없는 경우
        if (!couponId) {
            return {
                user_coupon_id: null,
                originalPrice,
                discountPrice: 0,
                totalPrice: originalPrice,
            };
        }

        // 쿠폰이 있는 경우
        const userCoupon = await this.couponService.findUserCouponByUserIdAndCouponIdwithLock(
            userId,
            couponId,
            tx,
        );
        await this.couponService.validateCoupon(userCoupon);

        // 쿠폰 상태 업데이트
        await this.couponService.updateUserCouponStatus(userCoupon.id, CouponStatus.USED, tx);

        const couponInfo = await this.couponService.findCouponByIdwithLock(
            userCoupon.coupon_id,
            tx,
        );
        const priceInfo = await this.couponService.calculateAllPrice(couponInfo, originalPrice);

        return {
            user_coupon_id: userCoupon.id,
            originalPrice: priceInfo.originalPrice,
            discountPrice: priceInfo.discountPrice,
            totalPrice: priceInfo.totalPrice,
        };
    }
}
