import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
    IProductRepository,
    IPRODUCT_REPOSITORY,
} from '../../infrastructure/product.repository.interface';
import { product as PrismaProduct } from '@prisma/client';

@Injectable()
export class ProductService {
    constructor(
        @Inject(IPRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) {}

    async findById(id: number): Promise<PrismaProduct | null> {
        this.validateId(id);
        return this.productRepository.findById(id);
    }

    async findByIdwithLock(id: number): Promise<PrismaProduct[] | null> {
        this.validateId(id);
        return this.productRepository.findByIdwithLock(id);
    }

    private validateId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('유효하지 않은 상품 ID입니다.');
        }
    }
}
