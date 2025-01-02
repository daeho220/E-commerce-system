import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CouponIssueRequestDto } from '../application/dto/issue-coupon-request.dto';
import { CouponResponseDto } from '../application/dto/issue-coupon-response.dto';
import { GetUserCouponResponseDto } from '../application/dto/get-user-coupon-response.dto';

@ApiTags('Coupons (Mock)')
@Controller('coupons')
export class CouponMockController {
    private coupons = [
        {
            couponId: 1,
            code: 'DISCOUNT10',
            discountAmount: 10,
            discountType: 'amount',
            expirationType: 'absolute',
            absoluteExpirationDate: new Date('2023-12-31'),
            issueStartDate: new Date('2023-01-01'),
            issueEndDate: new Date('2023-12-31'),
            currentCount: 0,
            maxCount: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            couponId: 2,
            code: 'SAVE20',
            discountAmount: 20,
            discountType: 'percentage',
            expirationType: 'relative',
            expirationDays: 30,
            issueStartDate: new Date('2023-01-01'),
            issueEndDate: new Date('2023-12-31'),
            currentCount: 0,
            maxCount: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            couponId: 3,
            code: 'SAVE30',
            discountAmount: 30,
            discountType: 'amount',
            expirationType: 'absolute',
            absoluteExpirationDate: new Date('2025-12-31'),
            issueStartDate: new Date('2023-01-01'),
            issueEndDate: new Date('2023-12-31'),
            currentCount: 0,
            maxCount: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    private userCoupons = [];

    @Post('issue')
    @ApiOperation({
        summary: '선착순 쿠폰 발급',
        description: '사용자에게 선착순 할인 쿠폰을 발급합니다.',
    })
    @ApiBody({ type: CouponIssueRequestDto })
    @ApiResponse({ status: 201, description: '쿠폰 발급 성공', type: CouponResponseDto })
    @ApiResponse({ status: 404, description: '사용자 또는 쿠폰을 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '쿠폰 발급 불가' })
    issueCoupon(@Body() couponIssueRequestDto: CouponIssueRequestDto): CouponResponseDto {
        const coupon = this.coupons.find((c) => c.couponId === couponIssueRequestDto.couponId);
        if (!coupon) {
            throw new NotFoundException(
                `Coupon with ID ${couponIssueRequestDto.couponId} not found`,
            );
        }

        // 발급 한도 체크
        if (coupon.currentCount >= coupon.maxCount) {
            throw new BadRequestException('쿠폰 발급 한도를 초과했습니다.');
        }

        // 중복 체크 로직 추가
        const existingUserCoupon = this.userCoupons.find(
            (uc) =>
                uc.userId === couponIssueRequestDto.userId &&
                uc.couponId === couponIssueRequestDto.couponId,
        );

        if (existingUserCoupon) {
            throw new BadRequestException(
                `User with ID ${couponIssueRequestDto.userId} already has coupon with ID ${couponIssueRequestDto.couponId}`,
            );
        }

        const userCoupon = {
            userCouponId: this.userCoupons.length + 1,
            userId: couponIssueRequestDto.userId,
            couponId: coupon.couponId,
            issueDate: new Date(),
            expirationDate:
                coupon.expirationType === 'absolute'
                    ? coupon.absoluteExpirationDate
                    : new Date(Date.now() + coupon.expirationDays * 24 * 60 * 60 * 1000),
            used: false,
        };

        this.userCoupons.push(userCoupon);

        // 쿠폰 발급 후 수량 증가
        coupon.currentCount++;

        return {
            userId: userCoupon.userId,
            couponId: userCoupon.couponId,
            expirationDate: userCoupon.expirationDate.toISOString(),
        };
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: '보유 쿠폰 목록 조회',
        description: '사용자가 보유한 쿠폰 목록을 조회합니다.',
    })
    @ApiParam({ name: 'userId', required: true, description: '사용자 ID' })
    @ApiResponse({
        status: 200,
        description: '쿠폰 목록 조회 성공',
        type: [GetUserCouponResponseDto],
    })
    @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
    getUserCoupons(@Param('userId') userId: number): GetUserCouponResponseDto[] {
        const userIdNumber = Number(userId);
        const userCoupons = this.userCoupons.filter((uc) => uc.userId === userIdNumber);

        if (userCoupons.length === 0) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 위한 쿠폰을 찾을 수 없습니다.`);
        }

        return userCoupons.map((userCoupon) => {
            const coupon = this.coupons.find((c) => c.couponId === userCoupon.couponId);
            return {
                couponId: coupon.couponId,
                code: coupon.code,
                discountAmount: coupon.discountAmount,
                discountType: coupon.discountType,
                expirationDate: userCoupon.expirationDate.toISOString(),
                issueDate: userCoupon.issueDate.toISOString(),
            };
        });
    }
}
