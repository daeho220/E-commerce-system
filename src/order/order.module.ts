import { Module } from '@nestjs/common';
import { OrdersMockController } from './mock/order.mock.controller';

@Module({
    imports: [],
    controllers: [OrdersMockController],
    providers: [],
})
export class OrderModule {}
