import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from '../domain/service/user.service';
import { user as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HistoryService } from '../../history/domain/service/history.service';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
import { LoggerUtil } from '../../common/utils/logger.util';
import { RedisRedlock } from '../../database/redis/redis.redlock';
import { ExecutionError } from 'redlock';
@Injectable()
export class UserFacade {
    private readonly LOCK_TTL = 5000; // 5초

    constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService,
        private readonly historyService: HistoryService,
        private readonly redisRedlock: RedisRedlock,
    ) {}

    async chargeUserPoint(userId: number, amount: number): Promise<PrismaUser> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const initialUser = await this.userService.findById(userId, tx);
                if (!initialUser) {
                    throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
                }

                const user = await this.userService.chargeUserPoint(
                    userId,
                    amount,
                    initialUser.point,
                    tx,
                );

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

    async chargeUserPointWithDistributedLock(userId: number, amount: number): Promise<PrismaUser> {
        const lockKey = `user:${userId}:point`;
        try {
            const redlock = await this.redisRedlock.getRedlock();
            const lock = await redlock.acquire([lockKey], this.LOCK_TTL, {
                retryCount: 0,
                retryDelay: 0,
            });
            try {
                return await this.prisma.$transaction(async (tx) => {
                    const initialUser = await this.userService.findById(userId, tx);
                    if (!initialUser) {
                        throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
                    }

                    const user = await this.userService.chargeUserPointWithLock(userId, amount, tx);

                    await this.historyService.createPointHistory(
                        userId,
                        amount,
                        PointChangeType.CHARGE,
                        tx,
                    );

                    return user;
                });
            } catch (error) {
                LoggerUtil.error('분산락 포인트 충전 오류', error, { userId, amount });
                if (error instanceof ExecutionError) {
                    throw new ConflictException('다른 사용자가 포인트를 충전하고 있습니다.');
                }
                throw error;
            } finally {
                await lock.release();
            }
        } catch (error) {
            LoggerUtil.error('분산락 포인트 충전 오류', error, { userId, amount });
            throw error;
        }
    }
}
