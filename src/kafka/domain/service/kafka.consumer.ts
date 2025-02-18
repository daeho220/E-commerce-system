import { Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class KafkaConsumerService {
    // emit()으로 발행된 메시지 수신
    @MessagePattern('test-topic')
    async handleMessage(@Payload() message: any) {
        console.log('Received message:', message);
    }
}
