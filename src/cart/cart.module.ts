import { Module } from '@nestjs/common';
import { CartsMockController } from './mock/cart.mock.controller';
@Module({
    imports: [],
    controllers: [CartsMockController],
    providers: [],
})
export class CartModule {}
