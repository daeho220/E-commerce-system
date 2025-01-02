import { Module } from '@nestjs/common';
import { PaymentsMockController } from './mock/payment.mock.controller';

@Module({
    imports: [],
    controllers: [PaymentsMockController],
    providers: [],
})
export class PaymentModule {}
