import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { outbox as PrismaOutbox, Prisma } from '@prisma/client';
import { getClient } from '../../common/util';
import { IOutboxRepository } from '../domain/outbox.repository.interface';
@Injectable()
export class OutboxRepository implements IOutboxRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createOutbox(
        outbox: Omit<PrismaOutbox, 'id' | 'created_at' | 'status' | 'updated_at'>,
    ): Promise<PrismaOutbox> {
        const client = getClient(this.prisma);
        return await client.outbox.create({
            data: outbox,
        });
    }

    async findOutboxInitStatus(): Promise<PrismaOutbox[]> {
        const client = getClient(this.prisma);
        const outbox = await client.outbox.findMany({
            where: {
                status: 'INIT',
            },
        });
        return outbox;
    }

    async updateOutboxStatus(key: string, status: string): Promise<PrismaOutbox> {
        const client = getClient(this.prisma);

        const outbox = await client.outbox.findFirst({
            where: { key },
        });

        return await client.outbox.update({
            where: { id: outbox.id },
            data: { status: status as PrismaOutbox['status'] },
        });
    }
}
