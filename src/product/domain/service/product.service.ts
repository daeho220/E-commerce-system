import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, IPRODUCT_REPOSITORY } from '../../domain/product.repository.interface';
import { product as PrismaProduct } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';

@Injectable()
export class ProductService {
    constructor(
        @Inject(IPRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    // 상품 조회
    async findById(id: number): Promise<PrismaProduct | null> {
        this.commonValidator.validateProductId(id);
        return this.productRepository.findById(id);
    }

    // 상품 조회 with Lock
    async findByIdwithLock(id: number): Promise<PrismaProduct | null> {
        this.commonValidator.validateProductId(id);
        return this.productRepository.findByIdwithLock(id);
    }

    // 상품 재고 감소
    async decreaseStock(id: number, quantity: number): Promise<PrismaProduct> {
        this.commonValidator.validateProductId(id);
        this.commonValidator.validateProductQuantity(quantity);
        return this.productRepository.decreaseStock(id, quantity);
    }
}
