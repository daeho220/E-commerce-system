import { Module } from '@nestjs/common';
import { KafkaController } from './presentation/kafka.controller';
import { KafkaConsumerService } from './domain/service/kafka.consumer';

@Module({
    controllers: [KafkaController],
    providers: [KafkaConsumerService],
})
export class KafkaModule {}
