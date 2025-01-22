import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import { RedisRedlock } from './redis.redlock';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [RedisService, RedisRedlock],
    exports: [RedisService, RedisRedlock],
})
export class RedisModule {}
