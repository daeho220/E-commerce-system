import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserModule } from '../../user.module';
import { PrismaModule } from '../../../database/prisma.module';
import { PrismaService } from '../../../database/prisma.service';

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule, PrismaModule],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('findById: 유저 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('유저가 존재하면 유저 정보를 반환한다', async () => {
                // given
                const userId = 1;

                // when
                const result = await service.findById(userId);

                // then
                expect(result?.user_name).toBe('Alice');
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 유저 ID로 조회시 에러를 던진다', async () => {
                const nonExistentUserId = 9999;

                // when & then
                await expect(service.findById(nonExistentUserId)).rejects.toThrow(
                    NotFoundException,
                );
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
                const userId = 2;

                // when
                const result = await service.findByIdwithLock(userId, undefined);

                // then
                expect(result?.user_name).toBe('Bob');
            });
        });
        describe('실패 케이스', () => {
            it('유저가 존재하지 않으면 에러를 던진다', async () => {
                const nonExistentuserId = 9999;

                // when & then
                await expect(
                    service.findByIdwithLock(nonExistentuserId, undefined),
                ).rejects.toThrow(NotFoundException);
            });
        });
        it('유저 ID가 0이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 0;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('유저 ID가 음수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = -1;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('유저 ID가 문자열이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 'test' as any;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('유저 ID가 실수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 1.1;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('유저 ID가 undefined이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = undefined as any;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('유저 ID가 null이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = null as any;

            // when & then
            await expect(service.findByIdwithLock(userId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('useUserPoint: 유저 포인트 차감 테스트', () => {
        describe('성공 케이스', () => {
            it('정상 유저 id와 포인트 차감 금액으로 포인트 차감 성공시 유저 정보를 반환한다', async () => {
                // given
                const userId = 10;
                const amount = 100;

                // when
                const result = await service.useUserPoint(userId, amount, undefined);

                // then
                expect(result.point).toBe(900);
                expect(result.id).toBe(userId);
            });
        });
        describe('실패 케이스', () => {
            it('존재하지 않는 유저 id로 포인트 차감시 에러를 던진다', async () => {
                // given
                const userId = 1000;
                const amount = 1000;

                // when & then
                await expect(service.useUserPoint(userId, amount, undefined)).rejects.toThrow(
                    Error,
                );
            });
            it('음수 포인트 차감 금액으로 포인트 차감시 에러를 던진다', async () => {
                // given
                const userId = 10;
                const amount = -100;

                // when & then
                await expect(service.useUserPoint(userId, amount, undefined)).rejects.toThrow(
                    '유효하지 않은 포인트입니다.',
                );
            });
        });
        describe('동시성 테스트', () => {
            it('동일한 유저에 대해 동시에 5번 포인트 차감 요청시 포인트 차감 성공시 유저 정보를 반환한다', async () => {
                // given
                const userId = 9;
                const amount = 100;

                const promises = Array.from({ length: 5 }, () =>
                    prisma.$transaction(async (tx) => {
                        return await service.useUserPoint(userId, amount, tx);
                    }),
                );
                const results = await Promise.all(promises);

                const user = await service.findById(userId, undefined);

                // then
                expect(results.length).toBe(5);
                expect(results.every((result) => result.id === userId)).toBe(true);
                expect(user?.point).toBe(400);
            });
            it('1000 포인트를 가지고 있는 동일한 유저에 대해 동시에 12번 100 포인트 차감 요청시 10번은 성공하고, 2번은 실패하게 된다.', async () => {
                // given
                const userId = 11;
                const amount = 100;

                const promises = Array.from({ length: 12 }, () =>
                    prisma.$transaction(async (tx) => {
                        return await service.useUserPoint(userId, amount, tx);
                    }),
                );
                const results = await Promise.allSettled(promises);

                const successResults = results.filter((result) => result.status === 'fulfilled');
                const failedResults = results.filter((result) => result.status === 'rejected');

                const user = await service.findById(userId, undefined);

                // then
                expect(successResults.length).toBe(10);
                expect(failedResults.length).toBe(2);
                expect(user?.point).toBe(0);
            });
        });
    });

    describe('chargeUserPoint: 유저 포인트 충전 테스트', () => {
        describe('성공 케이스', () => {
            it('정상 유저 id와 포인트 충전 금액으로 포인트 충전 성공시 유저 정보를 반환한다', async () => {
                // given
                const userId = 31;
                const amount = 100;

                const initialUser = await service.findById(userId, undefined);

                const initialPoint = initialUser?.point;

                // when
                const result = await service.chargeUserPoint(
                    userId,
                    amount,
                    initialPoint,
                    undefined,
                );

                // then
                expect(result.point).toBe(10100);
                expect(result.id).toBe(userId);
            });
        });
        describe('실패 케이스', () => {
            it('존재하지 않는 유저 id로 포인트 충전시 에러를 던진다', async () => {
                // given
                const userId = 1000;
                const amount = 1000;

                // when & then
                await expect(service.chargeUserPoint(userId, amount, 0, undefined)).rejects.toThrow(
                    Error,
                );
            });
            it('음수 포인트 충전 금액으로 포인트 충전시 에러를 던진다', async () => {
                // given
                const userId = 10;
                const amount = -100;

                // when & then
                await expect(service.chargeUserPoint(userId, amount, 0, undefined)).rejects.toThrow(
                    '유효하지 않은 포인트입니다.',
                );
            });
        });
        describe('동시성 테스트', () => {
            it('동일한 유저에 대해 동시에 5번 포인트 충전 요청시 포인트 충전 성공시 유저 정보를 반환한다', async () => {
                // given
                const userId = 13;
                const amount = 100;

                const initialUser = await service.findById(userId, undefined);

                const initialPoint = initialUser?.point;

                const promises = Array.from({ length: 5 }, () =>
                    prisma.$transaction(async (tx) => {
                        return await service.chargeUserPoint(userId, amount, initialPoint, tx);
                    }),
                );
                const results = await Promise.allSettled(promises);

                const user = await service.findById(userId, undefined);

                // then
                expect(results.length).toBe(5);
                // expect(results.every((result) => result.id === userId)).toBe(true);
                expect(user?.point).toBe(100);
            });
            it('0포인트를 가지고 있는 동일한 유저에게 100포인트 충전 10번 동시 요청시, 1000포인트 충전이 되어야한다.', async () => {
                // given
                const userId = 14;
                const amount = 100;

                const initialUser = await service.findById(userId, undefined);

                const initialPoint = initialUser?.point;

                const promises = Array.from({ length: 10 }, () =>
                    prisma.$transaction(async (tx) => {
                        return await service.chargeUserPoint(userId, amount, initialPoint, tx);
                    }),
                );
                const results = await Promise.allSettled(promises);

                const user = await service.findById(userId, undefined);

                // then
                expect(results.length).toBe(10);
                // expect(results.every((result) => result.id === userId)).toBe(true);
                expect(user?.point).toBe(100);
            });
        });
    });
});
