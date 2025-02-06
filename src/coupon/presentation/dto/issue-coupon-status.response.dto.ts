import { ApiProperty } from '@nestjs/swagger';

export class IssueStatusResponse {
    @ApiProperty({
        description: '발급 완료 여부',
        example: true,
    })
    issued: boolean;
}
