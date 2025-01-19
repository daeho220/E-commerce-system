import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
    @ApiProperty()
    statusCode: number;

    @ApiProperty()
    message: string;

    @ApiProperty()
    path: string;

    @ApiProperty()
    method: string;
}

export class ResponseFormat<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    data: T | null;

    @ApiProperty()
    timestamp: string;

    @ApiProperty({ required: false, type: ErrorResponse })
    error?: ErrorResponse;
}
