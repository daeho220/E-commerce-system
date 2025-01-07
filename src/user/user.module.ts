import { Module } from '@nestjs/common';
import { UserService } from './domain/service/user.service';
import { UserRepository } from './infrastructure/user.repository.mysql.impl';
import { IUSER_REPOSITORY } from './infrastructure/user.repository.interface';
import { PrismaModule } from '../database/prisma.module';
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [UserService, { provide: IUSER_REPOSITORY, useClass: UserRepository }],
})
export class UserModule {}
