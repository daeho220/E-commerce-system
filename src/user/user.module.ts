import { Module } from '@nestjs/common';
import { UserService } from './domain/service/user.service';
import { UserRepository } from './infrastructure/user.repository.mysql.impl';
import { IUSER_REPOSITORY } from './domain/user.repository.interface';
import { PrismaModule } from '../database/prisma.module';
import { CommonValidator } from '../common/common-validator';
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [
        UserService,
        { provide: IUSER_REPOSITORY, useClass: UserRepository },
        CommonValidator,
    ],
    exports: [UserService],
})
export class UserModule {}
