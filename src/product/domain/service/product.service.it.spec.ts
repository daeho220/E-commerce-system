import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { BadRequestException } from '@nestjs/common';
import { ProductModule } from '../../product.module';
import { PrismaModule } from '../../../database/prisma.module';

describe('ProductService', () => {
    let service: ProductService;

    beforeEach(async () => {
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
                    '상품 정보를 찾을 수 없습니다.',
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
                const result = await service.findByIdwithLock(productId);

                // then
                expect(result?.product_name).toBe('Product B');
            });
        });
        describe('실패 케이스', () => {
            it('상품이 존재하지 않으면 에러를 던진다', async () => {
                const nonExistentProductId = 9999;

                // when & then
                await expect(service.findByIdwithLock(nonExistentProductId)).rejects.toThrow(
                    '상품 정보를 찾을 수 없습니다.',
                );
            });
        });
        it('상품 ID가 0이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 0;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
        });
        it('상품 ID가 음수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = -1;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
        });
        it('상품 ID가 문자열이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 'test' as any;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
        });
        it('상품 ID가 실수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = 1.1;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
        });
        it('상품 ID가 undefined이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = undefined as any;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
        });
        it('상품 ID가 null이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
            // given
            const productId = null as any;

            // when & then
            await expect(service.findByIdwithLock(productId)).rejects.toThrow(BadRequestException);
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
                const result = await service.decreaseStock(productId, quantity);

                // then
                expect(result.stock).toBe(98);
            });
        });

        describe('실패 케이스', () => {
            it('존재하지 않은 상품ID가 주어지면 에러를 던진다', async () => {
                const nonExistentProductId = 9999;

                // when & then
                await expect(service.decreaseStock(nonExistentProductId, 1)).rejects.toThrow(
                    '상품 정보를 찾을 수 없습니다.',
                );
            });
            it('재고 감소 수량이 0이면 에러를 던진다', async () => {
                // given
                const productId = 6;
                const quantity = 0;

                // when & then
                await expect(service.decreaseStock(productId, quantity)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('재고 감소 수량이 음수이면 에러를 던진다', async () => {
                // given
                const productId = 6;
                const quantity = -1;

                // when & then
                await expect(service.decreaseStock(productId, quantity)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });
    });
});
