import { IProductRepository } from '../domain/product.repository.interface';
import { product as PrismaProduct, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { getClient } from '../../common/util';
@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaProduct | null> {
        const client = getClient(this.prisma, tx);
        const product = await client.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        return product;
    }

    async findByIdwithLock(
        id: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct | null> {
        const client = getClient(this.prisma, tx);
        const product = await client.$queryRaw<PrismaProduct[]>`
            SELECT * FROM product WHERE id = ${id} FOR UPDATE
        `;

        if (product.length === 0) {
            throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        return product[0];
    }

    async decreaseStock(
        id: number,
        quantity: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct> {
        try {
            const client = getClient(this.prisma, tx);
            const result = await client.product.update({
                where: {
                    id,
                    stock: {
                        gte: quantity,
                    },
                },
                data: { stock: { decrement: quantity } },
            });

            if (!result) {
                throw new Error('상품 정보를 찾을 수 없습니다.');
            }

            // 재고가 0이 되면, 상품 상태 변경
            if (result.stock === 0) {
                await client.product.update({
                    where: { id },
                    data: { status: false },
                });
            }

            return result;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new Error('상품 정보를 찾을 수 없습니다.');
            }
            throw error;
        }
    }
}
