import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxService } from '../../outbox/domain/service/outbox.service';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class OutboxScheduler {
    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
        private readonly outboxService: OutboxService,
    ) {}

    @Cron('0 */5 * * * *')
    async handleOutbox() {
        const initOutboxList = await this.outboxService.findOutboxInitStatus();

        for (const outbox of initOutboxList) {
            // 카프카 토픽 발행
            this.client.emit(outbox.topic, outbox.message);

            // 아웃박스 상태 업데이트
            await this.outboxService.updateOutboxStatus(outbox.key, 'PUBLISHED');
        }
    }
}
