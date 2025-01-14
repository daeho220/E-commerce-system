import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductModule } from '../../product.module';
import { PrismaModule } from '../../../database/prisma.module';

describe('ProductService', () => {
    let service: ProductService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ProductModule, PrismaModule],
        }).compile();

        service = module.get<ProductService>(ProductService);
    });

    describe('findById: 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품이 존재하면 상품 정보와 재고를 반환한다', async () => {
                // given
                const productId = 1;

                // when
                const result = await service.findById(productId);

                // then
                expect(result?.product_name).toBe('Product A');
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않는 상품 ID로 조회시 에러를 던진다', async () => {
                const nonExistentProductId = 9999;

                // when & then
                await expect(service.findById(nonExistentProductId)).rejects.toThrow(
                    'ID가 9999인 상품을 찾을 수 없습니다.',
                );
            });
            it('상품 ID가 0이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 0;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
            it('상품 ID가 음수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = -1;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
            it('상품 ID가 문자열이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 'test' as any;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
            it('상품 ID가 실수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 1.1;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
            it('상품 ID가 undefined이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = undefined as any;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
            it('상품 ID가 null이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = null as any;

                // when
                await expect(service.findById(productId)).rejects.toThrow(BadRequestException);
            });
        });
    });

    describe('findByIdwithLock: 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품이 존재하면 상품 정보와 재고를 반환한다', async () => {
                // given
                const productId = 2;

                // when
                const result = await service.findByIdwithLock(productId, undefined);

                // then
                expect(result?.product_name).toBe('Product B');
            });
        });
        describe('실패 케이스', () => {
            it('상품이 존재하지 않으면 에러를 던진다', async () => {
                const nonExistentProductId = 9999;

                // when & then
                await expect(
                    service.findByIdwithLock(nonExistentProductId, undefined),
                ).rejects.toThrow('ID가 9999인 상품을 찾을 수 없습니다.');
            });
        });
        it('상품 ID가 0이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 0;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('상품 ID가 음수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = -1;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('상품 ID가 문자열이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 'test' as any;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('상품 ID가 실수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 1.1;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('상품 ID가 undefined이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = undefined as any;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
        it('상품 ID가 null이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = null as any;

            // when & then
            await expect(service.findByIdwithLock(productId, undefined)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('decreaseStock: 상품 재고 감소 테스트', () => {
        describe('성공 케이스', () => {
            it('정상적인 상품 ID와 수량이 주어지면 재고가 감소한다', async () => {
                // given
                const productId = 6;
                const quantity = 2;

                // when
                // stock = 100 - 2 = 98
                const result = await service.decreaseStock(productId, quantity, undefined);

                // then
                expect(result.stock).toBe(98);
            });

            it('상품 재고가 0이 되면 상품 상태를 판매하지 않는 상태로 변경한다', async () => {
                // given
                const productId = 6;
                const quantity = 98;

                // when
                const result = await service.decreaseStock(productId, quantity, undefined);

                // then
                expect(result.status).toBe(false);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않은 상품ID가 주어지면 에러를 던진다', async () => {
                const nonExistentProductId = 9999;

                // when & then
                await expect(
                    service.decreaseStock(nonExistentProductId, 1, undefined),
                ).rejects.toThrow(Error);
            });
            it('재고 감소 수량이 0이면 에러를 던진다', async () => {
                // given
                const productId = 6;
                const quantity = 0;

                // when & then
                await expect(service.decreaseStock(productId, quantity, undefined)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('재고 감소 수량이 음수이면 에러를 던진다', async () => {
                // given
                const productId = 6;
                const quantity = -1;

                // when & then
                await expect(service.decreaseStock(productId, quantity, undefined)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('재고 감소 수량이 상품 재고보다 크면 에러를 던진다', async () => {
                // given
                const productId = 11;
                const quantity = 101;

                // when & then
                await expect(service.decreaseStock(productId, quantity, undefined)).rejects.toThrow(
                    Error,
                );
            });
        });
    });

    describe('findProducts: 상품 목록 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('page, limit가 정상적으로 주어지면 상품 목록과 페이지 정보를 반환한다', async () => {
                // given
                const page = 1;
                const limit = 10;

                // when
                const result = await service.findProducts(page, limit);

                // then
                expect(result.products.length).toBe(limit);
                expect(result.current_page).toBe(page);
                expect(result.limit).toBe(limit);
                expect(result.total).toBe(17);
                expect(result.total_pages).toBe(2);
            });
        });
        describe('실패 케이스', () => {
            it('page가 0이하이면 BadRequestException을 발생시킨다', async () => {
                // given
                const page = 0;
                const limit = 10;

                // when & then
                await expect(service.findProducts(page, limit)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('limit가 0이하이면 BadRequestException을 발생시킨다', async () => {
                // given
                const page = 1;
                const limit = 0;

                // when & then
                await expect(service.findProducts(page, limit)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품이 존재하지 않으면, NotFoundException을 발생시킨다', async () => {
                // given
                const page = 10;
                const limit = 10;

                // when & then
                await expect(service.findProducts(page, limit)).rejects.toThrow(NotFoundException);
            });
        });
    });

    describe('findTopSellingProducts: 상위 판매 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('최근 3일간의 상위 5개 판매 상품을 조회한다', async () => {
                // when
                const result = await service.findTop5SellingProductsIn3Days();

                // then
                expect(result.products).toHaveLength(5);
            });
        });
    });
});
