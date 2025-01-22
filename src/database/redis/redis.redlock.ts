import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redlock from 'redlock';

@Injectable()
export class RedisRedlock {
    private readonly redlock: Redlock;

    constructor(private readonly redisService: RedisService) {
        const redisClient = this.redisService.getClient();
        this.redlock = new Redlock([redisClient], {
            driftFactor: 0.01, // 클럭 드리프트 보정 (기본값: 0.01)
            retryCount: 100, // 재시도 횟수 (기본값: 10)
            retryDelay: 200, // 재시도 딜레이(ms, 기본값: 200)
            retryJitter: 50, // 지터 추가로 경합 줄이기(ms)
        });
    }

    async getRedlock(): Promise<Redlock> {
        return this.redlock;
    }
}
