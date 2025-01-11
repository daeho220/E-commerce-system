import { Injectable } from '@nestjs/common';
import { UserService } from '../domain/service/user.service';
import { user as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HistoryService } from '../../history/domain/service/history.service';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';

@Injectable()
export class UserFacade {
    constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService,
        private readonly historyService: HistoryService,
    ) {}

    async chargeUserPoint(userId: number, amount: number): Promise<PrismaUser> {
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
    }
}
