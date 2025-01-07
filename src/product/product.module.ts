import { Module } from '@nestjs/common';
import { ProductsMockController } from './mock/product.mock.controller';
import { ProductService } from './domain/service/product.service';
import { ProductRepository } from './infrastructure/product.repository.mysql.impl';
import { IPRODUCT_REPOSITORY } from './domain/product.repository.interface';
import { PrismaModule } from '../database/prisma.module';
import { CommonValidator } from '../common/common-validator';
@Module({
    imports: [PrismaModule],
    controllers: [ProductsMockController],
    providers: [
        ProductService,
        { provide: IPRODUCT_REPOSITORY, useClass: ProductRepository },
        CommonValidator,
    ],
})
export class ProductModule {}
