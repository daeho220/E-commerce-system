import { user as PrismaUser } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface IUserRepository {
    findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null>;
    findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null>;
}

export const IUSER_REPOSITORY = Symbol('IUSER_REPOSITORY');
