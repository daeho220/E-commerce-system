// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, params, query } = request;
        const now = Date.now();
        const requestId = `REQ_${now}_${Math.random().toString(36).substring(7)}`;

        // HTTP 로그 (요청)
        this.logger.log({
            level: 'http',
            requestId,
            message: 'HTTP Request',
            timestamp: new Date().toISOString(),
            method,
            url,
            queryParams: query,
            pathParams: params,
            requestBody: body,
        });

        return next.handle().pipe(
            tap({
                next: (data) => {
                    // HTTP 로그 (응답)
                    this.logger.log({
                        level: 'http',
                        requestId,
                        message: 'HTTP Response',
                        timestamp: new Date().toISOString(),
                        method,
                        url,
                        duration: `${Date.now() - now}ms`,
                        statusCode: context.switchToHttp().getResponse().statusCode,
                        responseData: data,
                    });
                },
                error: (error) => {
                    const errorResponse = {
                        timestamp: new Date().toISOString(),
                        level: 'error',
                        requestId,
                        method,
                        url,
                        duration: `${Date.now() - now}ms`,
                        error: {
                            statusCode: error.status || 500,
                            errorName: error.name,
                            errorMessage: error.message,
                        },
                        requestBody: body,
                        queryParams: query,
                        pathParams: params,
                    };

                    if (error.status >= 500) {
                        // 서버 에러 로그
                        this.logger.error({
                            ...errorResponse,
                            errorStack: error.stack,
                        });
                    } else if (error.status >= 400) {
                        // 클라이언트 에러 로그
                        this.logger.error(errorResponse);
                    }
                },
            }),
        );
    }
}
