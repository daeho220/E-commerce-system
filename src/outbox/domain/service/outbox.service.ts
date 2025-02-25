import { Injectable, Inject } from '@nestjs/common';
import { IOutboxRepository } from '../outbox.repository.interface';
import { outbox as PrismaOutbox } from '@prisma/client';
import { IOUTBOX_REPOSITORY } from '../outbox.repository.interface';
import { LoggerUtil } from '../../../common/utils/logger.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class OutboxService {
    constructor(
        @Inject(IOUTBOX_REPOSITORY)
        private readonly outboxRepository: IOutboxRepository,
    ) {}

    // outbox 생성
    async createOutbox(
        outbox: Omit<PrismaOutbox, 'id' | 'created_at' | 'status' | 'updated_at'>,
    ): Promise<PrismaOutbox> {
        try {
            return this.outboxRepository.createOutbox(outbox);
        } catch (error) {
            LoggerUtil.error('outbox 생성 오류', error, outbox);
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException('outbox 생성 중 오류가 발생했습니다.');
        }
    }

    // init 상태의 outbox 조회
    async findOutboxInitStatus(): Promise<PrismaOutbox[]> {
        try {
            return this.outboxRepository.findOutboxInitStatus();
        } catch (error) {
            LoggerUtil.error('outbox 조회 오류', error, {});
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException('outbox 조회 중 오류가 발생했습니다.');
        }
    }

    // outbox 상태 업데이트
    async updateOutboxStatus(key: string, status: string): Promise<PrismaOutbox> {
        try {
            return this.outboxRepository.updateOutboxStatus(key, status);
        } catch (error) {
            LoggerUtil.error('outbox 상태 업데이트 오류', error, { key, status });
            if (error instanceof PrismaClientKnownRequestError) {
                throw error;
            }
            throw new InternalServerErrorException('outbox 상태 업데이트 중 오류가 발생했습니다.');
        }
    }
}
