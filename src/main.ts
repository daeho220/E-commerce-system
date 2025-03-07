import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto as unknown as Crypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppConfigService } from './configs/configs.service';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>(AppConfigService.getKafkaConfigs(configService));
    await app.startAllMicroservices();

    // 전역 필터 설정
    app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

    // 전역 인터셉터 설정
    // Winston Logger를 주입받아 Interceptor에 전달
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    // Swagger 설정
    const options = new DocumentBuilder()
        .setTitle('E-commerce API')
        .setDescription('API 명세서입니다.')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(3000);
}
bootstrap();
