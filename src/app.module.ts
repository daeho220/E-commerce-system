import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { PointModule } from './point/point.module';
import { CouponModule } from './coupon/coupon.module';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './configs/configs.service';
import { UserModule } from './user/user.module';
import { HistoryModule } from './history/history.module';

const serviceModules = [
    ProductModule,
    OrderModule,
    PaymentModule,
    PointModule,
    CouponModule,
    CartModule,
    UserModule,
    HistoryModule,
];

@Module({
    imports: [
        ...serviceModules,
        ConfigModule.forRoot(AppConfigService.getEnvConfigs()),
        PrismaModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
