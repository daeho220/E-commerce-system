import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { IHISTORY_REPOSITORY } from './domain/history.repository.interface';
import { HistoryRepository } from './infrastructure/history.repository.mysql.impl';
import { HistoryService } from './domain/service/history.service';
import { CommonValidator } from '../common/common-validator';
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [
        { provide: IHISTORY_REPOSITORY, useClass: HistoryRepository },
        HistoryService,
        CommonValidator,
    ],
    exports: [HistoryService],
})
export class HistoryModule {}
