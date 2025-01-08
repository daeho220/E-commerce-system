import { Module } from '@nestjs/common';
import { OrdersMockController } from './mock/order.mock.controller';
import { OrderService } from './domain/service/order.service';
import { OrderFacade } from './application/order.facade';
import { IORDER_REPOSITORY } from './domain/order.repository.interface';
import { OrderRepository } from './infrastructure/order.repository.mysql.impl';
import { PrismaModule } from '../database/prisma.module';
@Module({
    imports: [PrismaModule],
    controllers: [OrdersMockController],
    providers: [OrderService, { provide: IORDER_REPOSITORY, useClass: OrderRepository }],
})
export class OrderModule {}
