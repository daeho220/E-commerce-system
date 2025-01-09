import { Module } from '@nestjs/common';
import { OrdersMockController } from './mock/order.mock.controller';
import { OrderService } from './domain/service/order.service';
import { OrderFacade } from './application/order.facade';
import { IORDER_REPOSITORY } from './domain/order.repository.interface';
import { OrderRepository } from './infrastructure/order.repository.mysql.impl';
import { PrismaModule } from '../database/prisma.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { CouponModule } from '../coupon/coupon.module';

const modules = [UserModule, ProductModule, CouponModule];
@Module({
    imports: [PrismaModule, ...modules],
    controllers: [OrdersMockController],
    providers: [
        OrderService,
        OrderFacade,
        { provide: IORDER_REPOSITORY, useClass: OrderRepository },
    ],
})
export class OrderModule {}
