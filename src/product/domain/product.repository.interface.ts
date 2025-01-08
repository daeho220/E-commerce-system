import { product as PrismaProduct } from '@prisma/client';

export interface IProductRepository {
    findById(id: number): Promise<PrismaProduct | null>;
    findByIdwithLock(id: number): Promise<PrismaProduct | null>;
    decreaseStock(id: number, quantity: number): Promise<PrismaProduct>;
}

export const IPRODUCT_REPOSITORY = Symbol('IPRODUCT_REPOSITORY');
