import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CouponService } from '../domain/service/coupon.service';
import { IssueCouponRequestDto } from './dto/issue-coupon.request.dto';
import { IssueCouponResponseDto } from './dto/issue-coupon.response.dto';
import { CouponListResponseDto } from './dto/coupon-list.response.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) {}

    @Get('users/:userId')
    @ApiOperation({
        summary: '사용자 쿠폰 목록 조회',
        description: '특정 사용자가 보유한 쿠폰 목록을 조회합니다.',
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '사용자 ID',
    })
    @ApiResponse({
        status: 200,
        description: '쿠폰 목록 조회 성공',
        type: [CouponListResponseDto],
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
    async getCouponList(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<CouponListResponseDto[]> {
        const coupons = await this.couponService.findCouponListByUserId(userId);

        return coupons.map((coupon) => ({
            id: coupon.id,
            discount_type: coupon.discount_type,
            discount_amount: coupon.discount_amount,
            code: coupon.code,
        }));
    }

    @Post('issue')
    @ApiOperation({
        summary: '쿠폰 발급',
        description: '사용자에게 쿠폰을 발급합니다.',
    })
    @ApiResponse({
        status: 201,
        description: '쿠폰 발급 성공',
        type: IssueCouponResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청 (재고 부족, 발급 기간 아님 등)' })
    @ApiResponse({ status: 404, description: '쿠폰 또는 사용자를 찾을 수 없음' })
    @ApiResponse({ status: 409, description: '이미 발급받은 쿠폰' })
    async issueCoupon(
        @Body() issueCouponDto: IssueCouponRequestDto,
    ): Promise<IssueCouponResponseDto> {
        const result = await this.couponService.createUserCoupon(
            issueCouponDto.user_id,
            issueCouponDto.coupon_id,
        );

        return {
            id: result.id,
            user_id: result.user_id,
            coupon_id: result.coupon_id,
            status: result.status,
            expiration_date: result.expiration_date,
        };
    }
}
