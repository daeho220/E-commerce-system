import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';

@Injectable()
export class UserService {
    constructor(
        @Inject(IUSER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    async findById(id: number): Promise<PrismaUser | null> {
        this.commonValidator.validateUserId(id);
        return this.userRepository.findById(id);
    }

    async findByIdwithLock(id: number): Promise<PrismaUser[] | null> {
        this.commonValidator.validateUserId(id);
        return this.userRepository.findByIdwithLock(id);
    }
}
