import { Module } from '@nestjs/common';
import { CouponService } from './domain/service/coupon.service';
import { CouponRepository } from './infrastructure/coupon.repository.mysql.impl';
import { ICOUPON_REPOSITORY } from './domain/coupon.repository.interface';
import { PrismaModule } from '../database/prisma.module';
import { CommonValidator } from '../common/common-validator';
import { CouponController } from './presentation/coupon.controller';
import { CouponRedisRepository } from './infrastructure/coupon.repository.redis.impl';
import { CouponScheduler } from './presentation/coupon.scheduler';
@Module({
    imports: [PrismaModule],
    controllers: [CouponController],
    providers: [
        CouponService,
        { provide: ICOUPON_REPOSITORY, useClass: CouponRepository },
        CommonValidator,
        CouponRedisRepository,
        CouponScheduler,
    ],
    exports: [CouponService, CouponScheduler],
})
export class CouponModule {}
