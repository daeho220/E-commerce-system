import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PointResponseDto } from '../application/dto/point-response.dto';
import { PointRequestDto } from '../application/dto/point-request.dto';

@ApiTags('Points (Mock)')
@Controller('points')
export class PointsMockController {
    private users = [
        {
            userId: 1,
            userName: 'User A',
            point: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            userId: 2,
            userName: 'User B',
            point: 500,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    @Get(':userId')
    @ApiOperation({ summary: '포인트 조회', description: '사용자 ID를 통해 포인트를 조회합니다.' })
    @ApiParam({ name: 'userId', required: true, description: '사용자 ID' })
    @ApiResponse({ status: 200, description: '포인트 조회 성공', type: PointResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
    getPoint(@Param('userId') userId: number): PointResponseDto {
        const user = this.users.find((u) => u.userId === userId);
        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }
        return {
            userId: user.userId,
            point: user.point,
        };
    }

    @Post('charge')
    @ApiOperation({
        summary: '포인트 충전',
        description: '사용자 ID와 충전할 금액을 입력받아 포인트를 충전합니다.',
    })
    @ApiResponse({ status: 200, description: '충전 성공', type: PointResponseDto })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    chargePoint(@Body() body: PointRequestDto): PointResponseDto {
        const { userId, amount } = body;
        const user = this.users.find((u) => u.userId === userId);
        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }
        if (amount <= 0) {
            throw new BadRequestException('충전할 금액은 0보다 커야 합니다.');
        }
        user.point += amount;
        return {
            userId: user.userId,
            point: user.point,
        };
    }
}
