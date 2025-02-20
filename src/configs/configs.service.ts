import { Module } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({})
export class AppConfigService {
    static getEnvConfigs(): ConfigModuleOptions {
        return {
            isGlobal: true,
            ignoreEnvFile: true,
            validationSchema: Joi.object({
                DB_HOST: Joi.string().default('localhost'),
                DB_PORT: Joi.number().default(3306),
                DB_PASSWORD: Joi.string().default('root'),
                DB_USER: Joi.string().default('root'),
                DB_NAME: Joi.string().default('ecommerce'),
                DATABASE_URL: Joi.string().default('mysql://root:root@localhost:3306/ecommerce'),
                REDIS_HOST: Joi.string().default('localhost'),
                REDIS_PORT: Joi.number().default(6379),
            }),
        };
    }

    static getKafkaConfigs(configService: ConfigService): MicroserviceOptions {
        return {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: 'commerce-server',
                    brokers: configService.get<string>('KAFKA_BROKER').split(','),
                },
                consumer: {
                    groupId: 'commerce-group',
                },
                producer: {
                    allowAutoTopicCreation: true,
                },
            },
        };
    }
}
