import { Module } from '@nestjs/common';
import { PaymentService } from './domain/service/payment.service';
import { PaymentRepository } from './infrastructure/payment.repository.mysql.impl';
import { PrismaModule } from '../database/prisma.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { CouponModule } from '../coupon/coupon.module';
import { CommonValidator } from '../common/common-validator';
import { PaymentFacade } from './application/payment.facade';
import { IPAYMENT_REPOSITORY } from './domain/payment.repository.interface';
import { OrderModule } from '../order/order.module';
import { HistoryModule } from '../history/history.module';
import { PaymentController } from './presentation/payment.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CompleteCreatePaymentHandler } from './event/complete-create-payment.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OutboxModule } from '../outbox/outbox.module';
import { CompleteCreatePaymentConsumer } from './presentation/complete-create-payment.consumer';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { OutboxScheduler } from './presentation/outbox.scheduler';

const modules = [UserModule, ProductModule, CouponModule, OrderModule, HistoryModule];
@Module({
    imports: [
        PrismaModule,
        ...modules,
        CqrsModule,
        OutboxModule,
        ClientsModule.registerAsync([
            {
                name: 'KAFKA_CLIENT',
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: configService.get<string>('KAFKA_BROKER').split(','),
                            clientId: 'commerce-server',
                        },
                        consumer: {
                            groupId: 'commerce-group',
                            allowAutoTopicCreation: true,
                        },
                        subscribe: {
                            fromBeginning: true, // 처음부터 메시지 수신
                        },
                    },
                }),
                inject: [ConfigService],
                imports: [ConfigModule],
            },
        ]),
    ],
    controllers: [PaymentController, CompleteCreatePaymentConsumer],
    providers: [
        CommonValidator,
        PaymentService,
        PaymentFacade,
        { provide: IPAYMENT_REPOSITORY, useClass: PaymentRepository },
        CompleteCreatePaymentHandler,
    ],
    exports: [PaymentService, PaymentFacade],
})
export class PaymentModule {}
