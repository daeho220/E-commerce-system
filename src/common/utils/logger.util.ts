import * as winston from 'winston';
import { winstonConfig } from '../../configs/winston.config';

const logger = winston.createLogger(winstonConfig);

export class LoggerUtil {
    static error(message: string, error: any, requestData: any) {
        const errorObj = {
            requestData,
            error,
            statusCode: error.statusCode || 500,
        };
        logger.error(message, errorObj);
    }
}
