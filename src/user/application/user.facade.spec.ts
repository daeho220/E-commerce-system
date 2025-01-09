import { Test, TestingModule } from '@nestjs/testing';
import { UserFacade } from './user.facade';
import { user as PrismaUser } from '@prisma/client';
import { point_history as PrismaPointHistory } from '@prisma/client';
import { PointChangeType } from '../../history/domain/type/pointChangeType.enum';
import { HistoryService } from '../../history/domain/service/history.service';
import { UserService } from '../domain/service/user.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CommonValidator } from '../../common/common-validator';
describe('UserFacade', () => {
    let facade: UserFacade;
    let userService: jest.Mocked<UserService>;
    let historyService: jest.Mocked<HistoryService>;
    let commonValidator: CommonValidator;
    const mockUser: PrismaUser = {
        id: 1,
        user_name: 'Alice',
        point: 100,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockHistory: PrismaPointHistory = {
        id: 1,
        user_id: 1,
        amount: 100,
        change_type: PointChangeType.CHARGE,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const mockUserService = {
            chargeUserPoint: jest.fn(),
        };
        const mockHistoryService = {
            createPointHistory: jest.fn(),
        };
        const mockPrismaService = {
            $transaction: jest.fn((callback) => callback()),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserFacade,
                { provide: UserService, useValue: mockUserService },
                { provide: HistoryService, useValue: mockHistoryService },
                { provide: PrismaService, useValue: mockPrismaService },
                CommonValidator,
            ],
        }).compile();

        facade = module.get<UserFacade>(UserFacade);
        userService = module.get(UserService);
        historyService = module.get(HistoryService);
        commonValidator = module.get<CommonValidator>(CommonValidator);
    });

    describe('chargeUserPoint', () => {
        describe('성공 케이스', () => {
            it('유저 ID, 충전 금액이 정상적으로 입력되면 유저 포인트가 충전되고 포인트 이력이 생성된다.', async () => {
                const userId = 1;
                const amount = 1000;

                jest.spyOn(userService, 'chargeUserPoint').mockResolvedValue({
                    ...mockUser,
                    point: mockUser.point + amount,
                });

                jest.spyOn(historyService, 'createPointHistory').mockResolvedValue(mockHistory);

                const result = await facade.chargeUserPoint(userId, amount);

                expect(result).toBeDefined();
                expect(result.point).toBe(1100);
            });
        });

        describe('실패 케이스', () => {
            it('유저 ID가 0이면 에러가 발생한다.', async () => {
                const userId = 0;
                expect(() => commonValidator.validateUserId(userId)).toThrow(
                    new BadRequestException('유효하지 않은 사용자 ID입니다.'),
                );
            });

            it('충전 금액이 0이면 에러가 발생한다.', async () => {
                const amount = 0;
                expect(() => commonValidator.validatePoint(amount)).toThrow(
                    new BadRequestException('유효하지 않은 포인트입니다.'),
                );
            });
        });
    });
});
