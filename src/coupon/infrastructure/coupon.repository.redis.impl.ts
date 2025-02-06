import { ConflictException, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from '../../database/redis/redis.service';
@Injectable()
export class CouponRedisRepository {
    private readonly redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = redisService.getClient();
    }

    // 대기열 조회
    async findUsersInWaitingQueue(couponId: number): Promise<number[]> {
        const waitingQueueKey = `coupon:${couponId}:waiting`;
        const users = await this.redis.zrange(waitingQueueKey, 0, -1);
        return users.map((user) => parseInt(user));
    }

    // 대기열에 사용자 추가
    async addToWaitingQueue(userId: number, couponId: number): Promise<void> {
        const waitingQueueKey = `coupon:${couponId}:waiting`;
        const score = Date.now();
        await this.redis
            .multi()
            .zadd(waitingQueueKey, score, userId)
            .expire(waitingQueueKey, 600) // 600초 = 10분
            .exec();
    }

    // 대기열에서 사용자 추출
    async popUsersFromWaitingQueue(couponId: number, count: number): Promise<number[]> {
        const waitingQueueKey = `coupon:${couponId}:waiting`;

        // 현재 대기열의 크기 확인
        const queueSize = await this.redis.zcard(waitingQueueKey);
        if (queueSize === 0) return [];

        // 실제 가져올 수 있는 수량 계산
        const actualCount = Math.min(count, queueSize);

        const users = await this.redis.zpopmin(waitingQueueKey, actualCount);

        // [member1, score1, member2, score2, ...] 형태에서 member만 추출
        return users
            .filter((_, index) => index % 2 === 0) // 짝수 인덱스만 선택 (member)
            .map((user) => parseInt(user));
    }

    // 쿠폰 발급 사용자 추가
    async addToIssuedQueue(userIds: number[], couponId: number): Promise<void> {
        const issuedQueueKey = `coupon:${couponId}:issued`;

        await this.redis
            .multi()
            .sadd(issuedQueueKey, userIds)
            .expire(issuedQueueKey, 600) // 600초 = 10분
            .exec();
    }

    // 해당 쿠폰을 발급 받은 유저 목록 조회
    async findUsersInIssuedCoupon(couponId: number): Promise<number[]> {
        const issuedQueueKey = `coupon:${couponId}:issued`;
        const userIds = await this.redis.smembers(issuedQueueKey);
        return userIds.map((user) => parseInt(user));
    }

    // 쿠폰 발급 상태 조회
    async checkIssuanceStatus(userId: number, couponId: number): Promise<number> {
        const issuedQueueKey = `coupon:${couponId}:issued`;
        return this.redis.sismember(issuedQueueKey, userId.toString());
    }
}
