import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from '../domain/service/user.service';
import { user as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HistoryService } from '../../history/domain/service/history.service';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
import { LoggerUtil } from '../../common/utils/logger.util';
import { RedisRedlock } from '../../database/redis/redis.redlock';
import { ExecutionError } from 'redlock';
import { LOCK_TTL } from '../../common/constants/redis.constants';

@Injectable()
export class UserFacade {
    constructor(
        private readonly userService: UserService,
        private readonly prisma: PrismaService,
        private readonly historyService: HistoryService,
        private readonly redisRedlock: RedisRedlock,
    ) {}

    // 포인트 충전 with 낙관적 락
    // async chargeUserPoint(userId: number, amount: number): Promise<PrismaUser> {
    //     try {
    //         return await this.prisma.$transaction(async (tx) => {
    //             const initialUser = await this.userService.findById(userId, tx);
    //             if (!initialUser) {
    //                 throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
    //             }

    //             const user = await this.userService.chargeUserPointWithOptimisticLock(
    //                 userId,
    //                 amount,
    //                 initialUser.point,
    //                 tx,
    //             );

    //             await this.historyService.createPointHistory(
    //                 userId,
    //                 amount,
    //                 PointChangeType.CHARGE,
    //                 tx,
    //             );

    //             return user;
    //         });
    //     } catch (error) {
    //         LoggerUtil.error('포인트 충전 오류', error, { userId, amount });
    //         throw error;
    //     }
    // }

    // 포인트 충전 with 분산락
    async chargeUserPoint(userId: number, amount: number): Promise<PrismaUser> {
        const lockKey = `user:${userId}:point`;
        try {
            const redlock = await this.redisRedlock.getRedlock();
            const lock = await redlock.acquire([lockKey], LOCK_TTL, {
                retryCount: 0,
                retryDelay: 0,
            });
            try {
                return await this.prisma.$transaction(async (tx) => {
                    const initialUser = await this.userService.findById(userId, tx);
                    if (!initialUser) {
                        throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
                    }

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
            if (error instanceof ExecutionError) {
                throw new ConflictException('포인트 충전에 실패했습니다.');
            }
            throw error;
        }
    }
}
