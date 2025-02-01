import { Module } from '@nestjs/common';
import { UserService } from './domain/service/user.service';
import { UserRepository } from './infrastructure/user.repository.mysql.impl';
import { IUSER_REPOSITORY } from './domain/user.repository.interface';
import { PrismaModule } from '../database/prisma.module';
import { CommonValidator } from '../common/common-validator';
import { UserFacade } from './application/user.facade';
import { HistoryModule } from '../history/history.module';
import { UserController } from './presentation/user.controller';
import { RedisModule } from '../database/redis/redis.module';
@Module({
    imports: [PrismaModule, HistoryModule, RedisModule],
    controllers: [UserController],
    providers: [
        UserService,
        UserFacade,
        { provide: IUSER_REPOSITORY, useClass: UserRepository },
        CommonValidator,
    ],
    exports: [UserService, UserFacade],
})
export class UserModule {}
