import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { IHistoryRepository, IHISTORY_REPOSITORY } from '../history.repository.interface';
import { PointChangeType } from '../type/pointChangeType.enum';
import { CommonValidator } from '../../../common/common-validator';
import { BadRequestException } from '@nestjs/common';
describe('HistoryService', () => {
    let service: HistoryService;
    let repository: IHistoryRepository;
    const mockPointHistory = {
        id: 1,
        user_id: 1,
        amount: 1000,
        change_type: PointChangeType.USE,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                {
                    provide: IHISTORY_REPOSITORY,
                    useValue: {
                        createPointHistory: jest.fn().mockResolvedValue(mockPointHistory),
                    },
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
        repository = module.get<IHistoryRepository>(IHISTORY_REPOSITORY);
    });

    describe('createPointHistory: 포인트 히스토리 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('유저 아이디, 포인트 변동량, 포인트 사용 타입 USE가 주어지면 포인트 히스토리를 생성한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;
                const changeType = PointChangeType.USE;

                jest.spyOn(repository, 'createPointHistory').mockResolvedValueOnce(
                    mockPointHistory,
                );

                // when
                const result = await service.createPointHistory(userId, amount, changeType);

                // then
                expect(result).toEqual(mockPointHistory);
            });

            it('유저 아이디, 포인트 변동량, 포인트 사용 타입 CHARGE가 주어지면 포인트 히스토리를 생성한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;
                const changeType = PointChangeType.CHARGE;

                jest.spyOn(repository, 'createPointHistory').mockResolvedValueOnce({
                    ...mockPointHistory,
                    change_type: PointChangeType.CHARGE,
                });

                // when
                const result = await service.createPointHistory(userId, amount, changeType);

                // then
                expect(result).toEqual({
                    ...mockPointHistory,
                    change_type: PointChangeType.CHARGE,
                });
            });
        });

        describe('실패 케이스', () => {
            it('유저 아이디가 주어지지 않으면 포인트 히스토리를 생성하지 않는다', async () => {
                // given
                const userId = null as any;
                const amount = 1000;
                const changeType = PointChangeType.USE;

                // when & then
                expect(service.createPointHistory(userId, amount, changeType)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('포인트 변동량이 0보다 작으면 포인트 히스토리를 생성하지 않는다', async () => {
                // given
                const userId = 1;
                const amount = -1000;
                const changeType = PointChangeType.USE;

                // when & then
                expect(service.createPointHistory(userId, amount, changeType)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('포인트 사용 타입이 유효하지 않으면 포인트 히스토리를 생성하지 않는다', async () => {
                // given
                const userId = 1;
                const amount = 1000;
                const changeType = 'INVALID' as any;

                // when & then
                expect(service.createPointHistory(userId, amount, changeType)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });
    });
});
