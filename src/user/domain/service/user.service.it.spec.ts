import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { UserModule } from '../../user.module';
import { PrismaModule } from '../../../database/prisma.module';

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule, PrismaModule],
        }).compile();

        service = module.get<UserService>(UserService);
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
                    '유저 정보를 찾을 수 없습니다.',
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
                const result = await service.findByIdwithLock(userId);

                // then
                expect(result?.[0].user_name).toBe('Bob');
            });
        });
        describe('실패 케이스', () => {
            it('유저가 존재하지 않으면 에러를 던진다', async () => {
                const nonExistentuserId = 9999;

                // when & then
                await expect(service.findByIdwithLock(nonExistentuserId)).rejects.toThrow(
                    '유저 정보를 찾을 수 없습니다.',
                );
            });
        });
        it('유저 ID가 0이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 0;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
        it('유저 ID가 음수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = -1;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
        it('유저 ID가 문자열이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 'test' as any;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
        it('유저 ID가 실수이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = 1.1;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
        it('유저 ID가 undefined이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = undefined as any;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
        it('유저 ID가 null이면 유저 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const userId = null as any;

            // when & then
            await expect(service.findByIdwithLock(userId)).rejects.toThrow(BadRequestException);
        });
    });
});
