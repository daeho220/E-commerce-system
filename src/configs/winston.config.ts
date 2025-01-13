// src/configs/winston.config.ts
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig = {
    transports: [
        // 에러 로그 (단일 파일)
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        // HTTP 로그 (날짜별 관리)
        new winston.transports.DailyRotateFile({
            filename: 'logs/http/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: null,
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            level: 'http',
        }),
    ],
};
