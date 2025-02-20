import { Test, TestingModule } from '@nestjs/testing';
import { OutboxModule } from '../../outbox.module';
import { PrismaModule } from '../../../database/prisma.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../../configs/winston.config';
import { OutboxService } from './outbox.service';
describe('OutboxService', () => {
    let service: OutboxService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OutboxModule, PrismaModule, WinstonModule.forRoot(winstonConfig)],
        }).compile();

        service = module.get<OutboxService>(OutboxService);
    });

    describe('createOutbox: outbox 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 outbox 데이터가 주어지면 outbox를 생성한다', async () => {
                // given
                const outboxData = {
                    topic: 'test-topic',
                    key: 'test-key',
                    message: 'test-message',
                };

                // when
                const result = await service.createOutbox({
                    topic: outboxData.topic,
                    key: outboxData.key,
                    message: outboxData.message,
                });

                // then
                expect(result.topic).toEqual(outboxData.topic);
                expect(result.key).toEqual(outboxData.key);
                expect(result.message).toEqual(outboxData.message);
            });
        });
    });

    describe('findOutboxInitStatus: outbox 조회 테스트', () => {
        it('init 상태의 outbox를 조회한다', async () => {
            // given
            const outboxData = {
                topic: 'test-topic',
                key: 'test-key2',
                message: 'test-message2',
            };

            await service.createOutbox(outboxData);

            // when
            const result = await service.findOutboxInitStatus();

            // then
            expect(result.length).toEqual(2);
            expect(result[0].status).toEqual('INIT');
            expect(result[1].status).toEqual('INIT');
        });
    });

    describe('updateOutboxStatus: outbox 상태 업데이트 테스트', () => {
        it('outbox 상태를 업데이트한다', async () => {
            // given
            const outboxDatas = await service.findOutboxInitStatus();

            // when
            const result = await service.updateOutboxStatus(outboxDatas[0].key, 'PUBLISHED');

            // then
            expect(result.status).toEqual('PUBLISHED');
        });
    });
});
