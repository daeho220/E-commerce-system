import { ApiProperty } from '@nestjs/swagger';

export class CouponQueueResponseDto {
    @ApiProperty({
        example: 'wait_success',
        description: '쿠폰 발급 상태(wait_success, issued_success, issued_wait, issued_end)',
    })
    status: string;

    @ApiProperty({
        example: '쿠폰 발급 대기열에 추가되었습니다.',
        description: '메시지',
    })
    message: string;
}
