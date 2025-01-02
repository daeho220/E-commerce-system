import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { PointModule } from './point/point.module';
import { CouponModule } from './coupon/coupon.module';
@Module({
    imports: [ProductModule, OrderModule, PaymentModule, PointModule, CouponModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
