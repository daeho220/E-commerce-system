import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { BadRequestException } from '@nestjs/common';
import { CouponModule } from '../../coupon.module';
import { PrismaModule } from '../../../database/prisma.module';
import { CouponStatus } from '../type/couponStatus.enum';
import { PrismaService } from '../../../database/prisma.service';
import { RedisModule } from '../../../database/redis/redis.module';
import { RedisService } from '../../../database/redis/redis.service';
import Client from 'ioredis';

describe('CouponService (Integration)', () => {
    let service: CouponService;
    let prisma: PrismaService;
    let redisService: RedisService;
    let redis: Client;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CouponModule, PrismaModule, RedisModule],
        }).compile();

        service = module.get<CouponService>(CouponService);
        prisma = module.get<PrismaService>(PrismaService);
        redisService = module.get<RedisService>(RedisService);
        redis = redisService.getClient();
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
                ).rejects.toThrow('사용자 ID 1가 쿠폰 ID 9999을 가지고 있지 않습니다.');
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
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 사용자 ID가 주어지면 NotFoundException을 발생시킨다', async () => {
                // given
                const userId = 9999;

                // when & then
                const result = await service.findCouponListByUserId(userId);

                expect(result).toBeDefined();
                expect(result.length).toBe(0);
            });
        });
    });

    describe('createUserCoupon: 사용자 쿠폰 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userId = 1;
                const couponId = 4;

                // when
                const result = await service.createUserCoupon(userId, couponId);

                const coupon = await prisma.coupon.findUnique({
                    where: { id: couponId },
                });

                // then
                expect(coupon?.current_count).toBe(1);
                expect(result).toBeDefined();
                expect(result?.user_id).toBe(userId);
                expect(result?.coupon_id).toBe(couponId);
                expect(result?.status).toBe('AVAILABLE');
                expect(result?.issue_date).toBeDefined();
                expect(result?.expiration_date).toBeDefined();
            });
        });
        describe('실패 케이스', () => {
            it('쿠폰 발급 가능일이 아니면 에러를 발생시킨다', async () => {
                // given
                const userId = 1;
                const couponId = 5;

                // when & then
                await expect(service.createUserCoupon(userId, couponId)).rejects.toThrow(
                    '쿠폰 ID 5의 발급 가능일이 아닙니다.',
                );
            });
            it('유저가 발급 받은 쿠폰이 이미 존재하면 에러를 발생시킨다', async () => {
                // given
                const userId = 1;
                const couponId = 1;

                // when & then
                await expect(service.createUserCoupon(userId, couponId)).rejects.toThrow(
                    `사용자 ID ${userId}가 이미 쿠폰 ID ${couponId}을 가지고 있습니다.`,
                );
            });
            it('쿠폰 재고가 없으면 에러를 발생시킨다', async () => {
                // given
                const userId = 1;
                const couponId = 11;

                // when & then
                await expect(service.createUserCoupon(userId, couponId)).rejects.toThrow(
                    '쿠폰 ID 11의 재고가 없습니다.',
                );
            });
        });
        describe('동시성 테스트', () => {
            it('동시에 50명이 총 재고가 30개인 쿠폰을 발급 받으면, 30명은 성공 하고 20명은 실패한다.', async () => {
                // given
                const userIds = Array.from({ length: 50 }, (_, i) => i + 1);
                const couponId = 12;

                // when
                const results = await Promise.allSettled(
                    userIds.map((userId) => service.createUserCoupon(userId, couponId)),
                );
                const successCount = results.filter(
                    (result) => result.status === 'fulfilled',
                ).length;
                const failureCount = results.filter(
                    (result) => result.status === 'rejected',
                ).length;

                const coupon = await prisma.coupon.findUnique({
                    where: { id: couponId },
                });

                // then
                expect(coupon?.current_count).toBe(30);
                expect(coupon?.max_count).toBe(30);
                expect(successCount).toBe(30);
                expect(failureCount).toBe(20);
                expect(coupon?.current_count).toBe(30);
            });
        });
    });

    describe('findIssuableCouponList: 발급 가능한 쿠폰 목록 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('발급 가능한 쿠폰 목록을 반환한다', async () => {
                // when
                const result = await service.findIssuableCouponList();

                // then
                expect(result).toBeDefined();
            });
        });
    });

    describe('createUserCoupons: 복수 개의 사용자 쿠폰 생성 테스트', () => {
        describe('성공 케이스', () => {
            it('userIds와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userIds = [1, 2, 3];
                const coupon = await service.findCouponByIdwithLock(16, undefined);

                // when
                await service.createUserCoupons(userIds, coupon);

                const userCoupons = await prisma.user_coupon.findMany({
                    where: { coupon_id: 16 },
                });

                // then
                expect(userCoupons.length).toBe(3);
                expect(userCoupons.map((userCoupon) => userCoupon.user_id)).toStrictEqual(userIds);
            });
        });
    });

    describe('findUsersInWaitingQueue & popUsersFromWaitingQueue: 대기열 사용자 추가 후 추출 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const couponId = 1;
                const userIds = [1, 2, 3, 4, 5];
                for (const userId of userIds) {
                    await service.addToWaitingQueue(userId, couponId);
                }

                // when
                const result = await service.popUsersFromWaitingQueue(couponId, 3);

                // then
                expect(result).toStrictEqual([1, 2, 3]);
                expect(result.length).toBe(3);
            });
        });
    });

    describe('addToIssuedQueue: 쿠폰 발급 완료 목록 추가 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userIds = [1, 2, 3];
                const couponId = 1;

                // when
                await service.addToIssuedQueue(userIds, couponId);
                const issuedQueue = await redis.smembers(`coupon:${couponId}:issued`);

                // then
                expect(issuedQueue.map(Number)).toStrictEqual(userIds); // 숫자 변환 비교
            });
        });
    });

    describe('findUsersInIssuedCoupon: 쿠폰 발급 완료 목록 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 쿠폰 ID가 주어지면, 발급 완료 목록을 반환한다', async () => {
                // given
                const couponId = 1;

                // when
                const issuedQueue = await service.findUsersInIssuedCoupon(couponId);

                // then
                expect(issuedQueue).toStrictEqual([1, 2, 3]);
            });
        });
    });

    describe('addToWaitingQueue: 쿠폰 발급 완료 목록 추가 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 사용자 ID와 쿠폰 ID가 주어지면 사용자 쿠폰 정보를 반환한다', async () => {
                // given
                const userIds = [1, 2, 3];
                const couponId = 1;

                // when
                await service.addToIssuedQueue(userIds, couponId);
                const issuedQueue = await redis.smembers(`coupon:${couponId}:issued`);

                // then
                expect(issuedQueue.map(Number)).toStrictEqual(userIds); // 숫자 변환 비교
            });
        });
    });

    describe('findUsersInIssuedCoupon: 쿠폰 발급 완료 목록 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 쿠폰 ID가 주어지면, 발급 완료 목록을 반환한다', async () => {
                // given
                const couponId = 1;

                // when
                const issuedQueue = await service.findUsersInIssuedCoupon(couponId);

                // then
                expect(issuedQueue).toStrictEqual([1, 2, 3]);
            });
            it('정상적인 쿠폰 ID가 주어졌지만, 발급 완료 목록이 없으면 빈 배열을 반환한다', async () => {
                // given
                const couponId = 2;

                // when
                const issuedQueue = await service.findUsersInIssuedCoupon(couponId);

                // then
                expect(issuedQueue).toStrictEqual([]);
            });
        });
    });

    describe('checkIssuanceStatus: 쿠폰 발급 상태 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('쿠폰이 발급된 유저와 해당 쿠폰이 주어지면 issued:true를 반환한다', async () => {
                // given
                const userId = 1;
                const couponId = 1;

                // when
                const result = await service.checkIssuanceStatus(userId, couponId);

                // then
                expect(result).toBeDefined();
                expect(result.issued).toBe(true);
            });
            it('쿠폰이 발급되지 않은 유저와 해당 쿠폰이 주어지면 issued:false를 반환한다', async () => {
                // given
                const userId = 10;
                const couponId = 2;

                // when
                const result = await service.checkIssuanceStatus(userId, couponId);

                // then
                expect(result).toBeDefined();
                expect(result.issued).toBe(false);
            });
        });
    });
});
