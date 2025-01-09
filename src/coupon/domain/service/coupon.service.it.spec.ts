import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { BadRequestException } from '@nestjs/common';
import { CouponModule } from '../../coupon.module';
import { PrismaModule } from '../../../database/prisma.module';
import { CouponStatus } from '../type/couponStatus.enum';

describe('CouponService (Integration)', () => {
    let service: CouponService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CouponModule, PrismaModule],
        }).compile();

        service = module.get<CouponService>(CouponService);
    });

    describe('findUserCouponByUserIdAndCouponId: 사용자 쿠폰 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userId = 6;
                const couponId = 6;

                // when
                const result = await service.findUserCouponByUserIdAndCouponIdwithLock(
                    userId,
                    couponId,
                    undefined,
                );

                // then
                expect(result).toBeDefined();
                expect(result?.user_id).toBe(userId);
                expect(result?.coupon_id).toBe(couponId);
                expect(result?.status).toBe('EXPIRED');
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 쿠폰 ID로 조회시 에러를 던진다', async () => {
                // given
                const userId = 1;
                const couponId = 9999;

                // when & then
                await expect(
                    service.findUserCouponByUserIdAndCouponIdwithLock(userId, couponId, undefined),
                ).rejects.toThrow('ID가 1인 사용자와 ID가 9999인 쿠폰을 찾을 수 없습니다.');
            });

            it('유효하지 않은 사용자 ID가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;
                const couponId = 1;

                // when & then
                await expect(
                    service.findUserCouponByUserIdAndCouponIdwithLock(userId, couponId, undefined),
                ).rejects.toThrow(BadRequestException);
            });

            it('유효하지 않은 쿠폰 ID가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 1;
                const couponId = -1;

                // when & then
                await expect(
                    service.findUserCouponByUserIdAndCouponIdwithLock(userId, couponId, undefined),
                ).rejects.toThrow(BadRequestException);
            });
        });
    });

    describe('findCouponById: 쿠폰 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 쿠폰 ID가 주어지면 쿠폰 정보를 반환한다', async () => {
                // given
                const couponId = 1;

                // when
                const result = await service.findCouponByIdwithLock(couponId, undefined);

                // then
                expect(result).toBeDefined();
                expect(result?.id).toBe(couponId);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 쿠폰 ID로 조회시 에러를 던진다', async () => {
                // given
                const couponId = 9999;

                // when & then
                await expect(service.findCouponByIdwithLock(couponId, undefined)).rejects.toThrow(
                    'ID가 9999인 쿠폰을 찾을 수 없습니다.',
                );
            });

            it('유효하지 않은 쿠폰 ID가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = 0;

                // when & then
                await expect(service.findCouponByIdwithLock(couponId, undefined)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });
    });

    describe('updateUserCouponStatus: 사용자 쿠폰 상태 업데이트 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 쿠폰 ID와 상태가 주어지면 사용자 쿠폰 상태를 업데이트한다', async () => {
                // given
                const userCouponId = 1;
                const status = CouponStatus.USED;

                // when
                const result = await service.updateUserCouponStatus(
                    userCouponId,
                    status,
                    undefined,
                );

                // then
                expect(result).toBeDefined();
                expect(result?.status).toBe(status);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 쿠폰 ID가 주어지면 Error를 발생시킨다', async () => {
                // given
                const userCouponId = 9999;
                const status = CouponStatus.USED;

                // when & then
                await expect(
                    service.updateUserCouponStatus(userCouponId, status, undefined),
                ).rejects.toThrow(Error);
            });

            it('유효하지 않은 쿠폰 상태가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const userCouponId = 1;
                const status = 'INVALID_STATUS' as any;

                // when & then
                await expect(
                    service.updateUserCouponStatus(userCouponId, status, undefined),
                ).rejects.toThrow(BadRequestException);
            });
        });
    });

    describe('findCouponByUserId: 사용자 쿠폰 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userId = 1;

                // when
                const result = await service.findCouponListByUserId(userId);
                // then
                expect(result).toBeDefined();
                expect(result.length).toBe(2);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 ID가 주어지면 NotFoundException을 발생시킨다', async () => {
                // given
                const userId = 9999;

                // when & then
                await expect(service.findCouponListByUserId(userId)).rejects.toThrow(
                    '사용자 ID 9999의 쿠폰을 찾을 수 없습니다.',
                );
            });
        });
    });
});
