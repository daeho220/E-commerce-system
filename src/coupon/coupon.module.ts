import { Module } from '@nestjs/common';
import { CouponMockController } from './mock/coupon.mock.controller';

@Module({
    imports: [],
    controllers: [CouponMockController],
    providers: [],
})
export class CouponModule {}
