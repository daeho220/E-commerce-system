import { Inject, Injectable } from '@nestjs/common';
import { IHistoryRepository, IHISTORY_REPOSITORY } from '../history.repository.interface';
import { PointChangeType } from '../type/pointChangeType.enum';
import { Prisma } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
@Injectable()
export class HistoryService {
    constructor(
        @Inject(IHISTORY_REPOSITORY)
        private readonly historyRepository: IHistoryRepository,
        private readonly commonValidator: CommonValidator,
    ) {}

    // 포인트 사용 내역 생성
    async createPointHistory(
        userId: number,
        amount: number,
        changeType: PointChangeType,
        tx?: Prisma.TransactionClient,
    ) {
        this.commonValidator.validateUserId(userId);
        this.commonValidator.validatePoint(amount);
        this.commonValidator.validatePointChangeType(changeType);
        return this.historyRepository.createPointHistory(userId, amount, changeType, tx);
    }
}
