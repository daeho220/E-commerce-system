import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import Redis from 'ioredis';
import Client from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redis: Client;

    constructor(private readonly configService: ConfigService) {
        this.redis = new Client({
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
        });
    }

    async onModuleInit() {
        try {
            await this.redis.ping();
        } catch (error) {
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.redis.quit();
    }

    getClient(): Client {
        return this.redis;
    }
}
