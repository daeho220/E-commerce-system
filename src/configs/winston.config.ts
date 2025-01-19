// src/configs/winston.config.ts
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig = {
    transports: [
        new winston.transports.File({
            filename: 'logs/application.log',
            level: 'http',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () =>
                        new Date().toLocaleString('ko-KR', {
                            timeZone: 'Asia/Seoul',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            fractionalSecondDigits: 3,
                        }),
                }),
                winston.format.json(),
                winston.format.prettyPrint(),
            ),
        }),
    ],
};
