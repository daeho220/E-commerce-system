## **Kafka와 NestJS 통합 보고서**

### **1. 개요**

  이 보고서는 NestJS 애플리케이션과 Kafka를 통합한 방법을 설명합니다. Kafka는 분산 메시징 시스템으로, 대량의 데이터를 실시간으로 처리하는 데 적합합니다. 이 보고서에서는 Kafka를 사용하여 메시지를 발행하고 소비하는 테스트 시스템을 구축하였습니다.

### **2. 시스템 구성**

**2.1 Docker Compose 설정**

  Kafka와 Zookeeper를 Docker Compose를 통해 설정하였습니다. docker-compose.yml 파일은 Zookeeper와 여러 Kafka 브로커를 정의하고, Kafka UI를 통해 메시지를 시각적으로 확인할 수 있도록 구성하였습니다.

```yaml
services:
    zookeeper:
        image: confluentinc/cp-zookeeper:latest
        ports:
            - '2181:2181'
        environment:
            ZOOKEEPER_CLIENT_PORT: 2181
            ZOOKEEPER_TICK_TIME: 3000
            ZOOKEEPER_INIT_LIMIT: 5
            ZOOKEEPER_SYNC_LIMIT: 2
            ZOOKEEPER_SERVER_ID: 1

    kafka-cluster1:
        image: confluentinc/cp-kafka:latest
        ports:
            - '9092:9092'
        depends_on:
            - zookeeper
        environment:
            KAFKA_BROKER_ID: 1
            KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
            KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT
            KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
            KAFKA_ADVERTISED_LISTENERS: INTERNAL://kafka-cluster1:29092,EXTERNAL://localhost:9092
            KAFKA_NUM_PARTITIONS: 3
            KAFKA_DEFAULT_REPLICATION_FACTOR: 3

    kafka-ui:
        image: provectuslabs/kafka-ui:latest
        ports:
            - '8080:8080'
        depends_on:
            - kafka-cluster1
            - kafka-cluster2
            - kafka-cluster3
        environment:
            KAFKA_CLUSTERS_0_NAME: local
            KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-cluster1:29092,kafka-cluster2:29093,kafka-cluster3:29094
            KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
```

**2.2 NestJS 모듈 설정**

  NestJS에서 Kafka를 사용하기 위해 @nestjs/microservices 패키지를 사용하였습니다. KafkaModule은 컨트롤러와 서비스를 포함하여 Kafka와의 통신을 담당합니다.

```tsx
@Module({
    controllers: [KafkaController],
    providers: [KafkaConsumerService],
})
export class KafkaModule {}
```

**2.3 Kafka 컨트롤러**

  KafkaController는 메시지를 발행하는 역할을 합니다. @Client 데코레이터를 사용하여 Kafka 클라이언트를 설정하고, emitMessage 메서드를 통해 메시지를 특정 토픽으로 발행합니다.

```tsx
@Controller('kafka')
export class KafkaController {
    @Client({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'commerce-server',
                brokers: (
                    process.env.KAFKA_BROKER || 'localhost:9092, localhost:9093, localhost:9094'
                ).split(','), // 기본값 설정
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
```

**2.4 Kafka Consumer Service**

  KafkaConsumerService는 Kafka로부터 메시지를 수신하는 역할을 합니다. @MessagePattern 데코레이터를 사용하여 특정 토픽의 메시지를 처리합니다.

```tsx
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

```

**2.5 main.ts**

  main.ts 파일에서는 다음과 같이 @nestjs/microservices를 사용하여, kafka와의 연결 설정을 했습니다.

```tsx
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>(AppConfigService.getKafkaConfigs());

    await app.startAllMicroservices();
    
    ...
}

// configs.service.ts/AppConfigService
static getKafkaConfigs(): MicroserviceOptions {
    return {
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'commerce-server',
                brokers: process.env.KAFKA_BROKER.split(','),
            },
            consumer: {
                groupId: 'commerce-group',
            },
            producer: {
                allowAutoTopicCreation: true,
            },
        },
    };
}
```

### **3. 테스트 및 검증**

Kafka UI를 사용하여 메시지가 올바르게 발행되고 소비되는지 확인하였습니다. Kafka UI는 브로커에 저장된 메시지를 시각적으로 확인할 수 있는 도구로, 메시지의 흐름을 쉽게 추적할 수 있습니다.

**3.1 Postman**

<img width="831" alt="postman 요청 사진" src="https://github.com/user-attachments/assets/6ae89043-00ff-4a95-9e7d-8391608bc08f" />

**3.2 kafka UI**

kafka UI를 확인해보았을 때, 아래와 같이 토픽이 발행된 것을 확인할 수 있다.

<img width="1233" alt="kafka-ui-토픽 발행사진" src="https://github.com/user-attachments/assets/c7f0a215-4932-41a6-933d-3db184cb0bbf" />

### **4. 결론**

  이 테스트 프로젝트를 통해 NestJS와 Kafka를 성공적으로 통합하였으며, 메시지 발행 및 소비가 원활하게 이루어짐을 확인하였습니다. Kafka UI를 통해 메시지의 흐름을 시각적으로 검증할 수 있어, 시스템의 신뢰성을 높일 수 있었습니다.
