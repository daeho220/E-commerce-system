import { user as PrismaUser } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface IUserRepository {
    findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null>;
    findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null>;
    useUserPoint(id: number, amount: number, tx: Prisma.TransactionClient): Promise<PrismaUser>;
    chargeUserPoint(
        id: number,
        amount: number,
        initialPoint: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser>;
    chargeUserPointWithLock(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser>;
}

export const IUSER_REPOSITORY = Symbol('IUSER_REPOSITORY');
