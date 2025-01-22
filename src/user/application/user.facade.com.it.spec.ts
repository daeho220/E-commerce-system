import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { PrismaModule } from '../../database/prisma.module';
import { UserFacade } from './user.facade';
import { PrismaService } from '../../database/prisma.service';
import { RedisModule } from '../../database/redis/redis.module';

describe('UserFacade', () => {
    let service: UserFacade;
    let prisma: PrismaService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [UserModule, PrismaModule, RedisModule],
        }).compile();

        service = module.get<UserFacade>(UserFacade);
        prisma = module.get<PrismaService>(PrismaService);
    });
    afterAll(async () => {
        await module.close();
    });

    describe('유저 포인트 충전 테스트', () => {
        describe('동일한 유저에게 1000원을 동시에 5번 충전 요청하면 포인트가 1000원만 충전된다.', () => {
            it('낙관적 락', async () => {
                const userId = 17;
                const amount = 1000;
                const times = 5;

                const promises = Array.from({ length: times }, () =>
                    service.chargeUserPoint(userId, amount),
                );

                // when
                const results = await Promise.allSettled(promises);

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failCount = results.filter((result) => result.status === 'rejected').length;

                const user = await prisma.user.findUnique({ where: { id: userId } });
                expect(user?.point).toBe(amount);
                expect(successCount).toBe(1);
                expect(failCount).toBe(4);
            });

            it('분산락', async () => {
                const userId = 18;
                const amount = 1000;
                const times = 5;

                const promises = Array.from({ length: times }, () =>
                    service.chargeUserPointWithDistributedLock(userId, amount),
                );

                // when
                const results = await Promise.allSettled(promises);

                // then
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failCount = results.filter((result) => result.status === 'rejected').length;

                const user = await prisma.user.findUnique({ where: { id: userId } });

                expect(user?.point).toBe(amount);
                expect(successCount).toBe(1);
                expect(failCount).toBe(4);
            });
        });
    });
});
