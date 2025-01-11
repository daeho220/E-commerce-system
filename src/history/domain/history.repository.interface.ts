import { Prisma, point_history as PrismaPointHistory } from '@prisma/client';
import { PointChangeType } from './type/pointChangeType.enum';
export interface IHistoryRepository {
    createPointHistory(
        userId: number,
        amount: number,
        changeType: PointChangeType,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaPointHistory>;
}

export const IHISTORY_REPOSITORY = Symbol('IHISTORY_REPOSITORY');
