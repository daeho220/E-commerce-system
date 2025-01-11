import { Module } from '@nestjs/common';
import { PaymentService } from './domain/service/payment.service';
import { PaymentRepository } from './infrastructure/payment.repository.mysql.impl';
import { PrismaModule } from '../database/prisma.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { CouponModule } from '../coupon/coupon.module';
import { CommonValidator } from '../common/common-validator';
import { PaymentFacade } from './application/payment.facade';
import { IPAYMENT_REPOSITORY } from './domain/payment.repository.interface';
// import { PaymentsMockController } from './mock/payment.mock.controller';
import { OrderModule } from '../order/order.module';
import { HistoryModule } from '../history/history.module';
import { PaymentController } from './presentation/payment.controller';

const modules = [UserModule, ProductModule, CouponModule, OrderModule, HistoryModule];
@Module({
    imports: [PrismaModule, ...modules],
    controllers: [PaymentController],
    providers: [
        CommonValidator,
        PaymentService,
        PaymentFacade,
        { provide: IPAYMENT_REPOSITORY, useClass: PaymentRepository },
    ],
    exports: [PaymentService, PaymentFacade],
})
export class PaymentModule {}
