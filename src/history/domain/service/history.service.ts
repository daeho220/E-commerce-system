import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { IHistoryRepository, IHISTORY_REPOSITORY } from '../history.repository.interface';
import { PointChangeType } from '../type/pointChangeType.enum';
import { Prisma } from '@prisma/client';
import { CommonValidator } from '../../../common/common-validator';
import { LoggerUtil } from '../../../common/utils/logger.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

        try {
            return this.historyRepository.createPointHistory(userId, amount, changeType, tx);
        } catch (error) {
            LoggerUtil.error('포인트 히스토리 생성 오류', error, { userId, amount, changeType });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException(`포인트 히스토리 생성 중 오류가 발생했습니다.`);
        }
    }
}
