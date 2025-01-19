import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { Prisma } from '@prisma/client';
import { LoggerUtil } from '../../../common/utils/logger.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class UserService {
    constructor(
        @Inject(IUSER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<PrismaUser | null> {
        this.commonValidator.validateUserId(id);
        try {
            const user = await this.userRepository.findById(id, tx);
            if (!user) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }
            return user;
        } catch (error) {
            LoggerUtil.error('유저 조회 오류', error, { id });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('유저 조회 중 오류가 발생했습니다.');
        }
    }

    async findByIdwithLock(id: number, tx: Prisma.TransactionClient): Promise<PrismaUser | null> {
        this.commonValidator.validateUserId(id);
        try {
            const user = await this.userRepository.findByIdwithLock(id, tx);
            if (!user) {
                throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
            }
            return user;
        } catch (error) {
            LoggerUtil.error('유저 조회 with lock 오류', error, { id });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('유저 조회 with lock 중 오류가 발생했습니다.');
        }
    }

    async useUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        this.commonValidator.validateUserId(id);
        this.commonValidator.validatePoint(amount);
        try {
            return await this.userRepository.useUserPoint(id, amount, tx);
        } catch (error) {
            LoggerUtil.error('유저 포인트 사용 오류', error, { id, amount });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof ConflictException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('유저 포인트 사용 중 오류가 발생했습니다.');
        }
    }

    async chargeUserPoint(
        id: number,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<PrismaUser> {
        this.commonValidator.validateUserId(id);
        this.commonValidator.validatePoint(amount);
        try {
            return await this.userRepository.chargeUserPoint(id, amount, tx);
        } catch (error) {
            LoggerUtil.error('유저 포인트 충전 오류', error, { id, amount });
            if (
                error instanceof PrismaClientKnownRequestError ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('유저 포인트 충전 중 오류가 발생했습니다.');
        }
    }
}
