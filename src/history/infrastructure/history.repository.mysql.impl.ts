import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IHistoryRepository } from '../domain/history.repository.interface';
import { Prisma, point_history as PrismaPointHistory } from '@prisma/client';
import { getClient } from '../../common/util';
import { PrismaService } from '../../database/prisma.service';
import { PointChangeType } from '../domain/type/pointChangeType.enum';
import { LoggerUtil } from '../../common/utils/logger.util';

@Injectable()
export class HistoryRepository implements IHistoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createPointHistory(
        userId: number,
        amount: number,
        changeType: PointChangeType,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaPointHistory> {
        const client = getClient(this.prisma, tx);
        try {
            return await client.point_history.create({
                data: {
                    user_id: userId,
                    amount: amount,
                    change_type: changeType,
                },
            });
        } catch (error) {
            LoggerUtil.error('포인트 히스토리 생성 오류', error, { userId, amount, changeType });
            throw new InternalServerErrorException(`포인트 히스토리 생성 중 오류가 발생했습니다.`);
        }
    }
}
