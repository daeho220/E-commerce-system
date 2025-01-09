import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { ICouponRepository, ICOUPON_REPOSITORY } from '../coupon.repository.interface';
import { user_coupon as PrismaUserCoupon, coupon as PrismaCoupon } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponStatus } from '../type/couponStatus.enum';
import { CommonValidator } from '../../../common/common-validator';

describe('CouponService', () => {
    let service: CouponService;
    let repository: ICouponRepository;
    let commonValidator: CommonValidator;

    const mockUserCoupon: PrismaUserCoupon = {
        id: 1,
        user_id: 1,
        coupon_id: 1,
        issue_date: new Date(),
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
        status: 'ACTIVE',
    };

    const mockCoupon: PrismaCoupon = {
        id: 1,
        code: '123456',
        discount_amount: 10,
        discount_type: 'PERCENT',
        expiration_type: 'ABSOLUTE',
        expiration_days: null,
        absolute_expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
        issue_start_date: new Date(),
        issue_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
        current_count: 100,
        max_count: 100,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockCoupon2: PrismaCoupon = {
        id: 2,
        code: '123457',
        discount_amount: 10,
        discount_type: 'PERCENT',
        expiration_type: 'ABSOLUTE',
        expiration_days: null,
        absolute_expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
        issue_start_date: new Date(),
        issue_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
        current_count: 100,
        max_count: 100,
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponService,
                {
                    provide: ICOUPON_REPOSITORY,
                    useValue: {
                        findUserCouponByUserIdAndCouponIdwithLock: jest
                            .fn()
                            .mockResolvedValue(mockUserCoupon),
                        findCouponByIdwithLock: jest.fn().mockResolvedValue(mockCoupon),
                        updateUserCouponStatus: jest.fn().mockResolvedValue(mockUserCoupon),
                        findCouponListByUserId: jest
                            .fn()
                            .mockResolvedValue([mockCoupon, mockCoupon2]),
                    },
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<CouponService>(CouponService);
        repository = module.get<ICouponRepository>(ICOUPON_REPOSITORY);
        commonValidator = module.get<CommonValidator>(CommonValidator);
    });

    describe('findUserCouponByUserIdAndCouponIdwithLock: 사용자 쿠폰 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userId = 1;
                const couponId = 1;

                // when
                const result = await service.findUserCouponByUserIdAndCouponIdwithLock(
                    userId,
                    couponId,
                    undefined,
                );

                // then
                expect(result).toEqual(mockUserCoupon);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 쿠폰 ID로 조회시 에러를 던진다', async () => {
                // given
                jest.spyOn(
                    repository,
                    'findUserCouponByUserIdAndCouponIdwithLock',
                ).mockRejectedValueOnce(new Error('사용자 쿠폰 정보를 찾을 수 없습니다.'));
                const userId = 9999;
                const couponId = 1;

                // when & then
                await expect(
                    service.findUserCouponByUserIdAndCouponIdwithLock(userId, couponId, undefined),
                ).rejects.toThrow('사용자 쿠폰 정보를 찾을 수 없습니다.');
            });

            it('유효하지 않은 사용자 ID가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const userId = 0;

                // when & then
                expect(() => commonValidator.validateUserId(userId)).toThrow(BadRequestException);
            });

            it('쿠폰 ID가 0이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = 0;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
            });

            it('쿠폰 ID가 음수이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = -1;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
            });

            it('쿠폰 ID가 문자열이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = 'test' as any;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
            });

            it('쿠폰 ID가 실수이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = 1.1;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
            });

            it('쿠폰 ID가 undefined이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = undefined as any;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
            });

            it('쿠폰 ID가 null이면 BadRequestException을 발생시킨다', async () => {
                // given
                const couponId = null as any;

                // when & then
                expect(() => commonValidator.validateCouponId(couponId)).toThrow(
                    BadRequestException,
                );
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
                expect(result).toEqual(mockCoupon);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 쿠폰 ID로 조회시 에러를 던진다', async () => {
                // given
                jest.spyOn(repository, 'findCouponByIdwithLock').mockRejectedValueOnce(
                    new Error('쿠폰 정보를 찾을 수 없습니다.'),
                );
                const couponId = 999;

                // when & then
                await expect(service.findCouponByIdwithLock(couponId, undefined)).rejects.toThrow(
                    '쿠폰 정보를 찾을 수 없습니다.',
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

                // mockUserCoupon의 상태를 업데이트된 상태로 설정
                const updatedUserCoupon = { ...mockUserCoupon, status };

                jest.spyOn(repository, 'updateUserCouponStatus').mockResolvedValueOnce(
                    updatedUserCoupon,
                );

                // when
                const result = await service.updateUserCouponStatus(
                    userCouponId,
                    status,
                    undefined,
                );

                // then
                expect(result).toEqual(updatedUserCoupon);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 쿠폰 ID가 주어지면 Error를 발생시킨다', async () => {
                // given
                jest.spyOn(repository, 'updateUserCouponStatus').mockRejectedValueOnce(
                    new Error('업데이트할 사용자 쿠폰 정보를 찾을 수 없습니다.'),
                );
                const userCouponId = 9999;
                const status = CouponStatus.USED;

                // when & then
                await expect(
                    service.updateUserCouponStatus(userCouponId, status, undefined),
                ).rejects.toThrow('업데이트할 사용자 쿠폰 정보를 찾을 수 없습니다.');
            });

            it('유효하지 않은 쿠폰 상태가 주어지면 BadRequestException을 발생시킨다', async () => {
                // given
                const status = 'INVALID_STATUS' as any;

                // when & then
                expect(() => commonValidator.validateCouponStatus(status)).toThrow(
                    BadRequestException,
                );
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
                expect(result).toEqual([mockCoupon, mockCoupon2]);
            });
        });
        describe('실패 케이스', () => {
            it('해당 사용자가 쿠폰을 가지고 있지 않으면 NotFoundException을 발생시킨다', async () => {
                // given
                const userId = 9999;

                jest.spyOn(repository, 'findCouponListByUserId').mockRejectedValueOnce(
                    new NotFoundException('사용자 ID 9999의 쿠폰을 찾을 수 없습니다.'),
                );
                // when & then
                await expect(service.findCouponListByUserId(userId)).rejects.toThrow(
                    '사용자 ID 9999의 쿠폰을 찾을 수 없습니다.',
                );
            });
        });
    });
});
