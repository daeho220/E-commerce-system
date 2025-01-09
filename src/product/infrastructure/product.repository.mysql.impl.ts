import { IProductRepository } from '../domain/product.repository.interface';
import { product as PrismaProduct, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getClient } from '../../common/util';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaProduct | null> {
        const client = getClient(this.prisma, tx);
        const product = await client.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`ID가 ${id}인 상품을 찾을 수 없습니다.`);
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
            throw new NotFoundException(`ID가 ${id}인 상품을 찾을 수 없습니다.`);
        }

        return product[0];
    }

    async decreaseStock(
        id: number,
        quantity: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct> {
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
            throw new NotFoundException(`ID가 ${id}인 상품을 찾을 수 없습니다.`);
        }

        // 재고가 0이 되면, 상품 상태 변경
        if (result.stock === 0) {
            await client.product.update({
                where: { id },
                data: { status: false },
            });
        }

        return result;
    }

    async findProducts(
        skip: number,
        limit: number,
    ): Promise<{
        products: PrismaProduct[];
        total: number;
    }> {
        const client = getClient(this.prisma);

        // 상품 목록 조회 (재고 정보의 정확성을 위해 FOR UPDATE 사용)
        const products = await client.$queryRaw<PrismaProduct[]>`
            SELECT 
                id,
                product_name,
                price,
                stock,
                status,
                created_at,
                updated_at
            FROM product
            WHERE status = true
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${skip}`;

        if (products.length === 0) {
            throw new NotFoundException('상품이 존재하지 않습니다.');
        }

        // 전체 상품 수 조회
        const [{ total }] = await client.$queryRaw<[{ total: number }]>`
            SELECT COUNT(*) as total
            FROM product
            WHERE status = true`;

        return {
            products,
            total,
        };
    }

    async findTop5SellingProductsIn3Days(
        startDate: Date,
        endDate: Date,
        limit: number,
    ): Promise<
        {
            id: number;
            product_name: string;
            price: number;
            stock: number;
            total_quantity: number;
            total_amount: number;
            order_count: number;
        }[]
    > {
        const client = getClient(this.prisma);

        // 집계 테이블을 활용한 상위 상품 조회
        const topProducts = await client.$queryRaw<
            {
                id: number;
                product_name: string;
                price: number;
                stock: number;
                total_quantity: number;
                total_amount: number;
                order_count: number;
            }[]
        >`
            SELECT 
                p.id,
                p.product_name,
                p.price,
                p.stock,
                SUM(ps.sales_quantity) as total_quantity,
                SUM(ps.sales_amount) as total_amount,
                SUM(ps.order_count) as order_count
            FROM product p
            INNER JOIN product_sales_stat ps ON p.id = ps.product_id
            WHERE 
                ps.date BETWEEN ${startDate} AND ${endDate}
                AND p.status = true
            GROUP BY p.id
            ORDER BY total_quantity DESC
            LIMIT ${limit}`;

        if (!topProducts || topProducts.length === 0) {
            throw new NotFoundException('상품이 존재하지 않습니다.');
        }

        return topProducts as {
            id: number;
            product_name: string;
            price: number;
            stock: number;
            total_quantity: number;
            total_amount: number;
            order_count: number;
        }[];
    }
}
