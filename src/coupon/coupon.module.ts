import { Module } from '@nestjs/common';
import { CouponMockController } from './mock/coupon.mock.controller';
import { CouponService } from './domain/service/coupon.service';
import { CouponRepository } from './infrastructure/coupon.repository.mysql.impl';
import { ICOUPON_REPOSITORY } from './domain/coupon.repository.interface';
import { PrismaModule } from '../database/prisma.module';
import { CommonValidator } from '../common/common-validator';
import { CouponController } from './presentation/coupon.controller';
@Module({
    imports: [PrismaModule],
    controllers: [CouponController],
    providers: [
        CouponService,
        { provide: ICOUPON_REPOSITORY, useClass: CouponRepository },
        CommonValidator,
    ],
    exports: [CouponService],
})
export class CouponModule {}
