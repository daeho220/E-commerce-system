import { Injectable } from '@nestjs/common';
import { UserService } from '../domain/service/user.service';
import { user as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HistoryService } from '../../history/domain/service/history.service';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LoggerUtil } from '../../common/utils/logger.util';

@Injectable()
export class UserFacade {
    constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService,
        private readonly historyService: HistoryService,
    ) {}

    async chargeUserPoint(userId: number, amount: number): Promise<PrismaUser> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const user = await this.userService.chargeUserPoint(userId, amount, tx);

                await this.historyService.createPointHistory(
                    userId,
                    amount,
                    PointChangeType.CHARGE,
                    tx,
                );

                return user;
            });
        } catch (error) {
            LoggerUtil.error('포인트 충전 오류', error, { userId, amount });
            throw error;
        }
    }
}
