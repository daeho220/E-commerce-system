import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { BadRequestException } from '@nestjs/common';
import { HistoryModule } from '../../history.module';
import { PrismaModule } from '../../../database/prisma.module';
import { PointChangeType } from '../type/pointChangeType.enum';

describe('HistoryService (Integration)', () => {
    let service: HistoryService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HistoryModule, PrismaModule],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    describe('createPointHistory: 포인트 히스토리 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('유저 아이디, 포인트 변동량, 포인트 사용 타입 USE가 주어지면 포인트 히스토리를 생성한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;
                const changeType = PointChangeType.USE;

                // when
                const result = await service.createPointHistory(userId, amount, changeType);

                // then
                expect(result.user_id).toBe(userId);
                expect(result.amount).toBe(amount);
                expect(result.change_type).toBe(changeType);
            });
            it('유저 아이디, 포인트 변동량, 포인트 사용 타입 CHARGE가 주어지면 포인트 히스토리를 생성한다', async () => {
                // given
                const userId = 1;
                const amount = 1000;
                const changeType = PointChangeType.CHARGE;

                // when
                const result = await service.createPointHistory(userId, amount, changeType);

                // then
                expect(result.user_id).toBe(userId);
                expect(result.amount).toBe(amount);
                expect(result.change_type).toBe(changeType);
            });
        });
        describe('실패 케이스', () => {
            it('유저 아이디가 유효하지 않으면 포인트 히스토리를 생성하지 않는다', async () => {
                // given
                const userId = null as any;
                const amount = 1000;
                const changeType = PointChangeType.USE;

                // when & then
                expect(service.createPointHistory(userId, amount, changeType)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('포인트 변동량이 유효하지 않으면 포인트 히스토리를 생성하지 않는다', async () => {
                // given
                const userId = 1;
                const amount = null as any;
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
                const changeType = null as any;

                // when & then
                expect(service.createPointHistory(userId, amount, changeType)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });
    });
});
