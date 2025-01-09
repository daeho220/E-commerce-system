import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFacade } from '../application/user.facade';
import { ChargePointRequestDto } from './dto/charge-point.request.dto';
import { ChargePointResponseDto } from './dto/charge-point.response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userFacade: UserFacade) {}

    @Post(':userId/points/charge')
    @ApiOperation({
        summary: '포인트 충전',
        description: '사용자의 포인트를 충전합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '포인트 충전 성공',
        type: ChargePointResponseDto,
    })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
    async chargePoint(
        @Body() chargePointDto: ChargePointRequestDto,
    ): Promise<ChargePointResponseDto> {
        const result = await this.userFacade.chargeUserPoint(
            chargePointDto.userId,
            chargePointDto.amount,
        );

        return {
            id: result.id,
            userName: result.user_name,
            point: result.point,
        };
    }
}
