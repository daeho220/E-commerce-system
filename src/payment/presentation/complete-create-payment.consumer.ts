// src/payment/event/complete-create-payment.consumer.ts
import { Controller, OnModuleInit } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { OutboxService } from '../../outbox/domain/service/outbox.service';
import { Inject } from '@nestjs/common';
import { FakeDataPlatform } from '../../common/fakeDataplatform';

@Controller()
export class CompleteCreatePaymentConsumer implements OnModuleInit {
    constructor(
        @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
        private readonly outboxService: OutboxService,
    ) {}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    @MessagePattern('payment-created')
    async handlePaymentCreated(@Payload() message: any) {
        // value가 문자열인 경우를 대비해 파싱 처리
        const value = typeof message.value === 'string' ? JSON.parse(message) : message;
        const { paymentId } = value;

        // 아웃박스 상태 업데이트
        await this.outboxService.updateOutboxStatus(paymentId.toString(), 'PUBLISHED');

        // 데이터 플랫폼 전송
        const fakeDataPlatform = new FakeDataPlatform();
        fakeDataPlatform.send();
    }
}
