import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export function getClient(
    prisma: PrismaService,
    tx?: Prisma.TransactionClient,
): Prisma.TransactionClient {
    return tx ?? prisma;
}
