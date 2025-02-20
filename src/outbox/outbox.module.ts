import { Module } from '@nestjs/common';
import { OutboxService } from './domain/service/outbox.service';
import { OutboxRepository } from './infrastructure/outbox.repository.mysql.impl';
import { IOUTBOX_REPOSITORY } from './domain/outbox.repository.interface';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [
        OutboxService,
        {
            provide: IOUTBOX_REPOSITORY,
            useClass: OutboxRepository,
        },
    ],
    exports: [OutboxService],
})
export class OutboxModule {}
