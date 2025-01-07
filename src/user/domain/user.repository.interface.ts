import { user as PrismaUser } from '@prisma/client';

export interface IUserRepository {
    findById(id: number): Promise<PrismaUser | null>;
    findByIdwithLock(id: number): Promise<PrismaUser[] | null>;
}

export const IUSER_REPOSITORY = Symbol('IUSER_REPOSITORY');
