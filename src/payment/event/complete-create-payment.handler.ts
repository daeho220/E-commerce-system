import { CompleteCreatePaymentEvent } from './complete-create-payment.event';
import { FakeDataPlatform } from '../../common/fakeDataplatform';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
// import { KafkaPublisherService } from '../../kafka/domain/service/kafka-publisher.service';
import { OutboxService } from '../../outbox/domain/service/outbox.service';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { log } from 'console';

@EventsHandler(CompleteCreatePaymentEvent)
export class CompleteCreatePaymentHandler implements IEventHandler<CompleteCreatePaymentEvent> {
    constructor(
        // private readonly publisher: KafkaPublisherService,
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
        private readonly outboxService: OutboxService,
    ) {}
    async handle(event: CompleteCreatePaymentEvent) {
        // outbox row 생성
        await this.outboxService.createOutbox({
            topic: 'payment-created',
            key: event.paymentId.toString(),
            message: JSON.stringify({
                paymentId: event.paymentId,
                orderId: event.orderId,
            }),
        });

        // 카프카 메시지 발행
        this.client.emit('payment-created', {
            key: event.paymentId.toString(),
            value: JSON.stringify({
                paymentId: event.paymentId,
                orderId: event.orderId,
            }),
        });
    }
}
