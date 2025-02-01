import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { CouponModule } from './coupon/coupon.module';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './configs/configs.service';
import { UserModule } from './user/user.module';
import { HistoryModule } from './history/history.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { RedisModule } from './database/redis/redis.module';

const serviceModules = [
    ProductModule,
    OrderModule,
    PaymentModule,
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
        WinstonModule.forRoot(winstonConfig),
        RedisModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
