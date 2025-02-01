import { IUserRepository } from '../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { NotFoundException, ConflictException } from '@nestjs/common';
@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null> {
        const client = getClient(this.prisma, tx);
        return await client.user.findUnique({
            where: { id },
        });
    }

    async findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null> {
        const client = getClient(this.prisma, tx);
        const user = await client.$queryRaw<PrismaUser[]>`
                SELECT * FROM user WHERE id = ${id} FOR UPDATE
            `;
        return user[0];
    }

    async useUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
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
    }

    // 낙관적 락 사용
    async chargeUserPoint(
        id: number,
        amount: number,
        initialPoint: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        const client = getClient(this.prisma, tx);

        const result = await client.$executeRaw`
            UPDATE user 
            SET point = point + ${amount}
            WHERE id = ${id} AND point = ${initialPoint}`;

        if (result === 0) {
            throw new ConflictException('충전 실패: 동시성 충돌');
        }

        return await client.user.findUnique({
            where: { id },
        });
    }

    // 분산락 사용
    async chargeUserPointWithLock(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        const client = getClient(this.prisma, tx);

        const result = await client.$executeRaw`
                UPDATE user 
                SET point = point + ${amount}
                WHERE id = ${id}`;

        if (result === 0) {
            throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
        }

        const updatedUser = await client.user.findUnique({
            where: { id },
        });

        if (!updatedUser) {
            throw new NotFoundException('포인트 업데이트 후 사용자 조회 실패');
        }

        return updatedUser;
    }
}
