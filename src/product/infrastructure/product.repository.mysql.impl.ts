import { IProductRepository } from '../domain/product.repository.interface';
import { product as PrismaProduct } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number): Promise<PrismaProduct | null> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        return product;
    }

    async findByIdwithLock(id: number): Promise<PrismaProduct | null> {
        const product = await this.prisma.$queryRaw<PrismaProduct[]>`
            SELECT * FROM product WHERE id = ${id} FOR UPDATE
        `;

        if (product.length === 0) {
            throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        return product[0];
    }

    async decreaseStock(id: number, quantity: number): Promise<PrismaProduct> {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: { stock: { decrement: quantity } },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error('상품 정보를 찾을 수 없습니다.');
            }
            throw error;
        }
    }
}
