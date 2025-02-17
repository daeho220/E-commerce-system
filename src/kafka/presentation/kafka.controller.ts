import { Controller, Post, Body } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
@Controller('kafka')
export class KafkaController {
    @Client({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'commerce-server',
                brokers: process.env.KAFKA_BROKER.split(','),
            },
            producer: {
                allowAutoTopicCreation: true,
            },
        },
    })
    private client: ClientKafka;

    async onModuleInit() {
        await this.client.connect();
    }

    @Post('emit')
    async emitMessage(@Body() body: { message: string }) {
        return this.client.emit('test-topic', {
            message: body.message,
            timestamp: new Date().toISOString(),
        });
    }
}
