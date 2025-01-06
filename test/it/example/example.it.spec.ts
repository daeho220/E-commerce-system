import { DatabaseModule } from '../../../src/database/database.module';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaModule } from '../../../src/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '../../../src/configs/configs.service';
describe('Should return expected result', () => {
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot(AppConfigService.getEnvConfigs()), PrismaModule],
        }).compile();
        moduleRef.useLogger(new Logger());
    });

    it('Should 1=1', async () => {
        // given

        //when

        //then

        expect(1).toEqual(1);
    });
});
