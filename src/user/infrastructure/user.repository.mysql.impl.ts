import { IUserRepository } from '../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null> {
        const client = getClient(this.prisma, tx);
        const user = await client.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        return user;
    }

    async findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null> {
        const client = getClient(this.prisma, tx);
        const user = await client.$queryRaw<PrismaUser[]>`
                SELECT * FROM user WHERE id = ${id} FOR UPDATE
            `;

        if (user.length === 0) {
            throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        return user[0];
    }
}
