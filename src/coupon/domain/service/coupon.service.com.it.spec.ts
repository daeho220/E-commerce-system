import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { CouponModule } from '../../coupon.module';
import { PrismaModule } from '../../../database/prisma.module';
import { PrismaService } from '../../../database/prisma.service';
import { RedisModule } from '../../../database/redis/redis.module';

describe('CouponService (Integration)', () => {
    let service: CouponService;
    let prisma: PrismaService;
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CouponModule, PrismaModule, RedisModule],
        }).compile();

        service = module.get<CouponService>(CouponService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('사용자 쿠폰 생성 테스트', () => {
        describe('동시에 50명이 총 재고가 30개인 쿠폰을 발급 받으면, 30명은 성공 하고 20명은 실패한다.', () => {
            it('비관적 락', async () => {
                // given
                const userIds = Array.from({ length: 50 }, (_, i) => i + 1);
                const couponId = 13;

                // when
                const results = await Promise.allSettled(
                    userIds.map((userId) => service.createUserCoupon(userId, couponId)),
                );
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failureCount = results.filter(
                    (result) => result.status === 'rejected',
                ).length;

                const coupon = await prisma.coupon.findUnique({
                    where: { id: couponId },
                });

                // then
                expect(coupon?.current_count).toBe(30);
                expect(coupon?.max_count).toBe(30);
                expect(successCount).toBe(30);
                expect(failureCount).toBe(20);
                expect(coupon?.current_count).toBe(30);
            });

            it('분산 락', async () => {
                // given
                const userIds = Array.from({ length: 50 }, (_, i) => i + 1);
                const couponId = 14;

                // when
                const results = await Promise.allSettled(
                    userIds.map((userId) =>
                        service.createUserCouponWithDistributedLock(userId, couponId),
                    ),
                );
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failureCount = results.filter(
                    (result) => result.status === 'rejected',
                ).length;

                const coupon = await prisma.coupon.findUnique({
                    where: { id: couponId },
                });

                // then
                expect(coupon?.current_count).toBe(30);
                expect(coupon?.max_count).toBe(30);
                expect(successCount).toBe(30);
                expect(failureCount).toBe(20);
                expect(coupon?.current_count).toBe(30);
            }, 30000);
        });
    });
});
