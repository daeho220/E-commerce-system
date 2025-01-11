import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { IUserRepository, IUSER_REPOSITORY } from '../../domain/user.repository.interface';
import { user as PrismaUser } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
describe('UserService', () => {
    let service: UserService;
    let repository: IUserRepository;
    let commonValidator: CommonValidator;

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
                        useUserPoint: jest.fn().mockResolvedValue(mockUser),
                        chargeUserPoint: jest.fn().mockResolvedValue(mockUser),
                    },
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get<IUserRepository>(IUSER_REPOSITORY);
        commonValidator = module.get<CommonValidator>(CommonValidator);
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

            // 유저 ID validation 테스트
            it('유저 ID가 0이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('유저 ID가 음수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = -1;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('유저 ID가 문자열이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 'test' as any;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('유저 ID가 실수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 1.1;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('유저 ID가 undefined이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = undefined as any;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('유저 ID가 null이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = null as any;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
        });
    });

    describe('findByIdwithLock: 유저 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('유저가 존재하면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;

                // when
                const result = await service.findByIdwithLock(userId, undefined);

                // then
                expect(result).toEqual(mockUser);
            });
        });
        describe('실패 케이스', () => {
            it('유저가 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findByIdwithLock').mockResolvedValueOnce(null);
                const userId = 1;

                // when
                const result = await service.findByIdwithLock(userId, undefined);

                // then
                expect(result).toBeNull();
            });
        });
    });

    describe('useUserPoint: 유저 포인트 차감 테스트', () => {
        describe('성공 케이스', () => {
            it('유저 포인트가 차감되면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;

                // when

                jest.spyOn(repository, 'useUserPoint').mockResolvedValueOnce({
                    ...mockUser,
                    point: mockUser.point - amount,
                });
                // when
                const result = await service.useUserPoint(userId, amount, undefined);

                // then
                expect(result).toEqual({
                    ...mockUser,
                    point: mockUser.point - amount,
                });
            });
        });
        describe('실패 케이스', () => {
            it('올바르지 않은 유저 ID로 포인트 차감시 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;

                // when
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });
            it('올바르지 않은 포인트로 포인트 차감시 BadRequestException을 발생시킨다', async () => {
                // given
                const amount = -1000;

                // when
                expect(() => commonValidator.validatePoint(amount)).toThrow(BadRequestException);
            });
            it('유저 포인트 차감 중 알 수 없는 오류가 발생하면 오류를 던진다', async () => {
                // given
                const userId = 1;
                const amount = 1000;

                // when
                jest.spyOn(repository, 'useUserPoint').mockRejectedValueOnce(new Error());

                // then
                await expect(service.useUserPoint(userId, amount, undefined)).rejects.toThrow(
                    Error,
                );
            });
            it('유저 포인트 차감 중 오류가 발생하면 오류를 던진다', async () => {
                // given
                const userId = 1;
                const amount = 1000;

                // when
                jest.spyOn(repository, 'useUserPoint').mockRejectedValueOnce(
                    new Error('유저 포인트 차감 중 오류가 발생했습니다.'),
                );

                // then
                await expect(service.useUserPoint(userId, amount, undefined)).rejects.toThrow(
                    '유저 포인트 차감 중 오류가 발생했습니다.',
                );
            });
        });
    });

    describe('chargeUserPoint: 유저 포인트 충전 테스트', () => {
        describe('성공 케이스', () => {
            it('유저 포인트가 충전되면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;

                // when
                jest.spyOn(repository, 'chargeUserPoint').mockResolvedValueOnce({
                    ...mockUser,
                    point: mockUser.point + amount,
                });

                // then
                const result = await service.chargeUserPoint(userId, amount, undefined);
                expect(result).toEqual({
                    ...mockUser,
                    point: mockUser.point + amount,
                });
            });
        });
        describe('실패 케이스', () => {
            describe('실패 케이스', () => {
                it('올바르지 않은 유저 ID로 포인트 충전시 BadRequestException을 발생시킨다', async () => {
                    // given
                    const userId = 0;

                    // when
                    expect(() => commonValidator.validateUserId(userId)).toThrow(
                        BadRequestException,
                    );
                });
                it('올바르지 않은 포인트로 포인트 충전시 BadRequestException을 발생시킨다', async () => {
                    // given
                    const amount = -1000;

                    // when
                    expect(() => commonValidator.validatePoint(amount)).toThrow(
                        BadRequestException,
                    );
                });
                it('유저 포인트 충전 중 알 수 없는 오류가 발생하면 오류를 던진다', async () => {
                    // given
                    const userId = 1;
                    const amount = 1000;

                    // when
                    jest.spyOn(repository, 'chargeUserPoint').mockRejectedValueOnce(new Error());

                    // then
                    await expect(
                        service.chargeUserPoint(userId, amount, undefined),
                    ).rejects.toThrow(Error);
                });
                it('유저 포인트 충전 중 오류가 발생하면 오류를 던진다', async () => {
                    // given
                    const userId = 1;
                    const amount = 1000;

                    // when
                    jest.spyOn(repository, 'chargeUserPoint').mockRejectedValueOnce(
                        new Error('유저 포인트 충전 중 오류가 발생했습니다.'),
                    );

                    // then
                    await expect(
                        service.chargeUserPoint(userId, amount, undefined),
                    ).rejects.toThrow('유저 포인트 충전 중 오류가 발생했습니다.');
                });
            });
        });
    });
});
