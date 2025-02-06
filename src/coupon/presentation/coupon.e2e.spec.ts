import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { RedisService } from '../../database/redis/redis.service';
import { CouponScheduler } from '../presentation/coupon.scheduler';
import Client from 'ioredis';
import { PrismaService } from '../../database/prisma.service';
import { webcrypto } from 'crypto';
global.crypto = webcrypto as any;

describe('CouponController (e2e)', () => {
    let app: INestApplication;
    let redisService: RedisService;
    let redis: Client;
    let scheduler: CouponScheduler;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        redisService = moduleFixture.get<RedisService>(RedisService);
        redis = redisService.getClient();
        scheduler = moduleFixture.get<CouponScheduler>(CouponScheduler);
        prisma = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /coupons/issue 동시성 테스트', () => {
        it('100개의 동시 요청시, coupon 16의 잔여 수량이 20개만 있는 경우, 20개의 쿠폰이 발급되어야 한다.', async () => {
            // given
            // 100개의 고유 사용자 ID 생성
            const userCount = 100;
            const userIds = Array.from({ length: userCount }, (_, i) => i + 1);

            // 100개의 병렬 요청 실행
            const requests = userIds.map((userId) =>
                request(app.getHttpServer()).post('/coupons/issue').send({
                    user_id: userId,
                    coupon_id: 16,
                }),
            );

            // when
            await Promise.all(requests);

            // 스케줄러 수동 실행
            await scheduler.handleCouponIssuance();

            // then
            const waitingQueue = await redis.zrange(`coupon:16:waiting`, 0, -1);
            const issuedQueue = await redis.smembers(`coupon:16:issued`);
            const issuedCoupons = await prisma.user_coupon.findMany({
                where: {
                    coupon_id: 16,
                },
            });

            expect(waitingQueue.length).toBe(80);
            expect(issuedQueue.length).toBe(20);
            expect(issuedCoupons.length).toBe(20);
        }, 30000);
    });
});
