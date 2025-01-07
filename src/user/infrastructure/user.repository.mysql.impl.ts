import { IUserRepository } from '../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: number): Promise<PrismaUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        return user;
    }

    async findByIdwithLock(id: number): Promise<PrismaUser[] | null> {
        return await this.prisma.$transaction(async (prisma) => {
            const user = await prisma.$queryRaw<PrismaUser[]>`
                SELECT * FROM user WHERE id = ${id} FOR UPDATE
            `;

            if (user.length === 0) {
                throw new Error('유저 정보를 찾을 수 없습니다.');
            }

            return user;
        });
    }
}
