import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponse, ResponseFormat } from '../classes/response.class';

// 성공 응답을 위한 데코레이터
export const ApiSuccessResponse = <TModel extends Type<any>>(
    status: number = 200,
    model: TModel,
    description: string,
) => {
    return applyDecorators(
        ApiExtraModels(ResponseFormat, model),
        ApiResponse({
            status,
            description,
            schema: {
                allOf: [
                    {
                        properties: {
                            success: {
                                type: 'boolean',
                                example: true,
                            },
                            data: {
                                type: 'object',
                                $ref: getSchemaPath(model),
                            },
                            timestamp: {
                                type: 'string',
                                example: new Date().toISOString(),
                            },
                        },
                    },
                ],
            },
        }),
    );
};

// 배열 응답을 위한 데코레이터
export const ApiSuccessArrayResponse = <TModel extends Type<any>>(
    status: number = 200,
    model: TModel,
    description: string,
) => {
    return applyDecorators(
        ApiExtraModels(ResponseFormat, model),
        ApiResponse({
            status,
            description,
            schema: {
                allOf: [
                    {
                        properties: {
                            success: {
                                type: 'boolean',
                                example: true,
                            },
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                            timestamp: {
                                type: 'string',
                                example: new Date().toISOString(),
                            },
                        },
                    },
                ],
            },
        }),
    );
};

// 실패 응답을 위한 데코레이터
export const ApiErrorResponse = (
    status: number,
    description: string,
    path?: string,
    method?: string,
) => {
    return applyDecorators(
        ApiResponse({
            status: status >= 500 ? status : 200, // 500번대는 그대로 전달
            description,
            content: {
                'application/json': {
                    schema: {
                        properties: {
                            success: {
                                type: 'boolean',
                                example: false,
                            },
                            data: {
                                type: 'null',
                                example: null,
                            },
                            timestamp: {
                                type: 'string',
                                example: new Date().toISOString(),
                            },
                            error: {
                                type: 'object',
                                properties: {
                                    statusCode: {
                                        type: 'number',
                                        example: status,
                                    },
                                    message: {
                                        type: 'string',
                                        example: description,
                                    },
                                    path: {
                                        type: 'string',
                                        example: '{API Path}',
                                    },
                                    method: {
                                        type: 'string',
                                        example: '{HTTP Method}',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
    );
};
