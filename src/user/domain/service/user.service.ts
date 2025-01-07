import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../infrastructure/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        @Inject(IUSER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async findById(id: number): Promise<PrismaUser | null> {
        this.validateId(id);
        return this.userRepository.findById(id);
    }

    async findByIdwithLock(id: number): Promise<PrismaUser[] | null> {
        this.validateId(id);
        return this.userRepository.findByIdwithLock(id);
    }

    private validateId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('유효하지 않은 유저 ID입니다.');
        }
    }
}
