import { outbox as PrismaOutbox } from '@prisma/client';

export interface IOutboxRepository {
    createOutbox(
        outbox: Omit<PrismaOutbox, 'id' | 'created_at' | 'status' | 'updated_at'>,
    ): Promise<PrismaOutbox>;
    findOutboxInitStatus(): Promise<PrismaOutbox[]>;
    updateOutboxStatus(key: string, status: string): Promise<PrismaOutbox>;
}

export const IOUTBOX_REPOSITORY = Symbol('IOUTBOX_REPOSITORY');
