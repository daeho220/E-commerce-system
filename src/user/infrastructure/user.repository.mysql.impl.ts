import { IUserRepository } from '../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { LoggerUtil } from '../../common/utils/logger.util';
@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null> {
        try {
            const client = getClient(this.prisma, tx);
            const user = await client.user.findUnique({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('유저 조회 오류', error, { id });
            throw new InternalServerErrorException(`유저 조회 중 오류가 발생했습니다.`);
        }
    }

    async findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null> {
        try {
            const client = getClient(this.prisma, tx);
            const user = await client.$queryRaw<PrismaUser[]>`
                SELECT * FROM user WHERE id = ${id} FOR UPDATE
            `;

            if (user.length === 0) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }

            return user[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('유저 조회 with lock 오류', error, { id });
            throw new InternalServerErrorException(`유저 조회 with lock 중 오류가 발생했습니다.`);
        }
    }

    async useUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        try {
            const client = getClient(this.prisma, tx);
            const user = await client.$queryRaw<PrismaUser[]>`
                SELECT * FROM \`user\` WHERE id = ${id} FOR UPDATE
            `;

            if (user.length === 0) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }

            const userData = user[0];

            if (userData.point < amount) {
                throw new ConflictException('유저 포인트 잔고가 부족합니다.');
            }

            const result = await client.user.update({
                where: {
                    id,
                    point: {
                        gte: amount,
                    },
                },
                data: { point: { decrement: amount } },
            });

            return result;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }

            LoggerUtil.error('유저 포인트 사용 오류', error, { id, amount });
            throw new InternalServerErrorException(`유저 포인트 사용 중 오류가 발생했습니다.`);
        }
    }

    async chargeUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        try {
            const client = getClient(this.prisma, tx);
            const user = await client.$queryRaw<PrismaUser[]>`
                SELECT * FROM \`user\` WHERE id = ${id} FOR UPDATE
            `;

            if (user.length === 0) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }

            const result = await client.user.update({
                where: {
                    id,
                },
                data: { point: { increment: amount } },
            });

            return result;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            LoggerUtil.error('유저 포인트 충전 오류', error, { id, amount });
            throw new InternalServerErrorException(`유저 포인트 충전 중 오류가 발생했습니다.`);
        }
    }
}
