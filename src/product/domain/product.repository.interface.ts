import { product as PrismaProduct, Prisma } from '@prisma/client';

export interface IProductRepository {
    findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaProduct | null>;
    findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaProduct | null>;
    decreaseStock(
        id: number,
        quantity: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaProduct>;
    findProducts(
        skip: number,
        limit: number,
    ): Promise<{
        products: PrismaProduct[];
        total: number;
    }>;
    findTop5SellingProductsIn3Days(
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
    >;
}

export const IPRODUCT_REPOSITORY = Symbol('IPRODUCT_REPOSITORY');
