import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { Prisma } from '@prisma/client';
@Injectable()
export class UserService {
    constructor(
        @Inject(IUSER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null> {
        this.commonValidator.validateUserId(id);
        return this.userRepository.findById(id, tx);
    }

    async findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null> {
        this.commonValidator.validateUserId(id);
        return this.userRepository.findByIdwithLock(id, tx);
    }

    async useUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        this.commonValidator.validateUserId(id);
        this.commonValidator.validatePoint(amount);
        return this.userRepository.useUserPoint(id, amount, tx);
    }

    async chargeUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        this.commonValidator.validateUserId(id);
        this.commonValidator.validatePoint(amount);
        return this.userRepository.chargeUserPoint(id, amount, tx);
    }
}
