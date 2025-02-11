import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CouponService } from '../domain/service/coupon.service';
import { LoggerUtil } from '../../common/utils/logger.util';

@Injectable()
export class CouponScheduler {
    constructor(private readonly couponService: CouponService) {}

    @Cron('*/10 * * * * *')
    async handleCouponIssuance() {
        const issuableCouponList = await this.couponService.findIssuableCouponList();

        for (const coupon of issuableCouponList) {
            try {
                // 발급 가능한 쿠폰 수량 계산
                const availableQuantity = coupon.max_count - coupon.current_count;
                if (availableQuantity <= 0) continue;

                // 대기열에서 사용자 추출
                const userIds = await this.couponService.popUsersFromWaitingQueue(
                    coupon.id,
                    availableQuantity,
                );
                if (userIds.length === 0) continue;

                // 쿠폰 발급 완료 set에 추가
                await this.couponService.addToIssuedQueue(userIds, coupon.id);

                // 복수 개의 사용자 쿠폰 생성
                await this.couponService.createUserCoupons(userIds, coupon);
            } catch (error) {
                LoggerUtil.error('쿠폰 발급 처리 중 오류', error, { coupon });
                throw error;
            }
        }
    }
}
