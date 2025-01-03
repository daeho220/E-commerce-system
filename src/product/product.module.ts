import { Module } from '@nestjs/common';
import { ProductsMockController } from './mock/product.mock.controller';

@Module({
    imports: [],
    controllers: [ProductsMockController],
    providers: [],
})
export class ProductModule {}
