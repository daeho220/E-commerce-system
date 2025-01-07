import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../infrastructure/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';

describe('UserService', () => {
    let service: UserService;
    let repository: IUserRepository;

    const mockUser: PrismaUser = {
        id: 1,
        user_name: 'Test User',
        point: 1000,
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: IUSER_REPOSITORY,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockUser),
                        findByIdwithLock: jest.fn().mockResolvedValue(mockUser),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get<IUserRepository>(IUSER_REPOSITORY);
    });

    describe('findById: 유저 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('유저가 존재하면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;

                // when
                const result = await service.findById(userId);

                // then
                expect(result).toEqual(mockUser);
                expect(repository.findById).toHaveBeenCalledWith(userId);
            });
        });
        describe('실패 케이스', () => {
            it('유저가 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);
                const userId = 1;

                // when
                const result = await service.findById(userId);

                // then
                expect(result).toBeNull();
            });
            it('유저 ID가 0이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 음수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = -1;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 문자열이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 'test' as any;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 실수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 1.1;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 undefined이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = undefined as any;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 null이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = null as any;

                // when
                await expect(service.findById(userId)).rejects.toThrow(BadRequestException);
            });
        });
    });

    describe('findByIdwithLock: 유저 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('유저가 존재하면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;

                // when
                const result = await service.findByIdwithLock(userId);

                // then
                expect(result).toEqual(mockUser);
                expect(repository.findByIdwithLock).toHaveBeenCalledWith(userId);
            });
        });
        describe('실패 케이스', () => {
            it('유저가 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findByIdwithLock').mockResolvedValueOnce(null);
                const userId = 1;

                // when
                const result = await service.findByIdwithLock(userId);

                // then
                expect(result).toBeNull();
                expect(repository.findByIdwithLock).toHaveBeenCalledWith(userId);
            });
            it('유저 ID가 0이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 음수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = -1;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 문자열이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 'test' as any;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 실수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 1.1;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 undefined이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = undefined as any;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
            it('유저 ID가 null이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = null as any;

                // when
                await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
            });
        });
    });
});
