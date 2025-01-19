import {
    Inject,
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { IProductRepository, IPRODUCT_REPOSITORY } from '../../domain/product.repository.interface';
import { product as PrismaProduct, Prisma } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { ProductsResponseDto } from '../../domain/dto/productsRes.dto';
import { TopSellingProductsDto } from '../../domain/dto/top-selling-products.dto';
import { LoggerUtil } from '../../../common/utils/logger.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class ProductService {
    constructor(
        @Inject(IPRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    // 상품 조회
    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaProduct | null> {
        this.commonValidator.validateProductId(id);
        try {
            const product = await this.productRepository.findById(id, tx);
            if (!product) {
                throw new NotFoundException(`ID가 ${id}인 상품을 찾을 수 없습니다.`);
            }
            return product;
        } catch (error) {
            LoggerUtil.error('상품 조회 오류', error, { id });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('상품 조회 중 오류가 발생했습니다.');
        }
    }

    // 상품 조회 with Lock
    async findByIdwithLock(
        id: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct | null> {
        this.commonValidator.validateProductId(id);
        try {
            const product = await this.productRepository.findByIdwithLock(id, tx);

            if (!product) {
                throw new NotFoundException(`ID가 ${id}인 상품을 찾을 수 없습니다.`);
            }

            return product;
        } catch (error) {
            LoggerUtil.error('상품 조회 with lock 오류', error, { id });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('상품 조회 중 오류가 발생했습니다.');
        }
    }

    // 상품 재고 감소
    async decreaseStock(
        id: number,
        quantity: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct> {
        this.commonValidator.validateProductId(id);
        this.commonValidator.validateProductQuantity(quantity);

        try {
            return await this.productRepository.decreaseStock(id, quantity, tx);
        } catch (error) {
            LoggerUtil.error('상품 재고 감소 오류', error, { id, quantity });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('상품 재고 감소 중 오류가 발생했습니다.');
        }
    }

    // 상품 목록 조회
    async findProducts(page: number, limit: number): Promise<ProductsResponseDto> {
        this.commonValidator.validatePage(page);
        this.commonValidator.validateLimit(limit);
        try {
            const skip = (page - 1) * limit;
            const { products, total } = await this.productRepository.findProducts(skip, limit);

            return {
                products: products.map((p) => ({
                    id: p.id,
                    product_name: p.product_name,
                    price: p.price,
                    stock: p.stock,
                })),
                current_page: page,
                limit,
                total: Number(total),
                total_pages: Math.ceil(Number(total) / limit),
            };
        } catch (error) {
            LoggerUtil.error('상품 목록 조회 오류', error, { page, limit });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('상품 목록 조회 중 오류가 발생했습니다.');
        }
    }

    // 3일간 가장 많이 팔린 상위 5개 상품 조회
    async findTop5SellingProductsIn3Days(): Promise<TopSellingProductsDto> {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 3);
        const limit = 5;

        try {
            const products = await this.productRepository.findTop5SellingProductsIn3Days(
                startDate,
                endDate,
                limit,
            );

            return {
                products: products.map((p) => ({
                    id: p.id,
                    product_name: p.product_name,
                    price: p.price,
                    stock: p.stock,
                    total_quantity: Number(p.total_quantity),
                    total_amount: Number(p.total_amount),
                    order_count: Number(p.order_count),
                })),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            };
        } catch (error) {
            LoggerUtil.error('상품 판매 순위 조회 오류', error, { startDate, endDate, limit });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('상품 판매 순위 조회 중 오류가 발생했습니다.');
        }
    }
}
