import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { PrismaModule } from '../../database/prisma.module';
import { UserFacade } from './user.facade';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
describe('UserFacade', () => {
    let service: UserFacade;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule, PrismaModule],
        }).compile();

        service = module.get<UserFacade>(UserFacade);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('chargeUserPoint: 유저 포인트 충전 테스트', () => {
        describe('성공 케이스', () => {
            it('포인트가 0인 유저 15에게 1000원 충전하면 포인트가 1000원 증가한다.', async () => {
                // given
                const userId = 15;
                const amount = 1000;

                // when
                const result = await service.chargeUserPoint(userId, amount);

                // then
                expect(result.point).toBe(1000);
                expect(result.user_name).toBe('Olivia');
                expect(result.id).toBe(userId);
            });
        });

        describe('실패 케이스', () => {
            it('유저 ID가 0이면 에러가 발생한다.', async () => {
                const userId = 0;
                const amount = 1000;

                await expect(service.chargeUserPoint(userId, amount)).rejects.toThrow(
                    new BadRequestException('유효하지 않은 사용자 ID입니다.'),
                );
            });
            it('포인트가 0이면 에러가 발생한다.', async () => {
                const userId = 15;
                const amount = 0;

                await expect(service.chargeUserPoint(userId, amount)).rejects.toThrow(
                    new BadRequestException('유효하지 않은 포인트입니다.'),
                );
            });
        });

        describe('동시성 테스트', () => {
            it('유저 16에게 1000원을 10번 충전하면 포인트가 10000원 증가한다.', async () => {
                const userId = 16;
                const amount = 1000;
                const times = 10;

                const promises = Array.from({ length: times }, () =>
                    service.chargeUserPoint(userId, amount),
                );
                await Promise.all(promises);

                const user = await prisma.user.findUnique({ where: { id: userId } });
                expect(user?.point).toBe(amount * times);
            });
        });
    });
});
