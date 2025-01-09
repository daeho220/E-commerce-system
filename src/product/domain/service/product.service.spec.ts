import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { IProductRepository, IPRODUCT_REPOSITORY } from '../product.repository.interface';
import { product as PrismaProduct } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { CommonValidator } from '../../../common/common-validator';
describe('ProductService', () => {
    let service: ProductService;
    let repository: IProductRepository;
    let commonValidator: CommonValidator;
    const mockProduct: PrismaProduct = {
        id: 1,
        product_name: 'Test Product',
        price: 1000,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
        stock: 100,
    };

    const mockProducts = {
        products: [
            {
                id: 1,
                product_name: 'Test Product',
                price: 1000,
                stock: 100,
            },
        ],
        total: 1,
        current_page: 1,
        limit: 10,
        total_pages: 1,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: IPRODUCT_REPOSITORY,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockProduct),
                        findByIdwithLock: jest.fn().mockResolvedValue(mockProduct),
                        decreaseStock: jest.fn().mockResolvedValue(mockProduct),
                        findProducts: jest.fn().mockResolvedValue(mockProducts),
                    },
                },
                CommonValidator,
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        repository = module.get<IProductRepository>(IPRODUCT_REPOSITORY);
        commonValidator = module.get<CommonValidator>(CommonValidator);
    });

    describe('findById: 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품이 존재하면 상품 정보와 재고를 반환한다', async () => {
                // given
                const productId = 1;

                // when
                const result = await service.findById(productId, undefined);

                // then
                expect(result).toEqual(mockProduct);
            });
        });
        describe('실패 케이스', () => {
            it('상품이 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);
                const productId = 1;

                // when
                const result = await service.findById(productId);

                // then
                expect(result).toBeNull();
            });

            // 상품 ID validation 테스트
            it('상품 ID가 0이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 0;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 음수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = -1;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 문자열이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 'test' as any;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 실수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 1.1;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 undefined이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = undefined as any;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 null이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = null as any;

                // when
                expect(() => commonValidator.validateProductId(productId)).toThrow(
                    BadRequestException,
                );
            });
        });
    });

    describe('findByIdwithLock: 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품이 존재하면 상품 정보와 재고를 반환한다', async () => {
                // given
                const productId = 1;

                // when
                const result = await service.findByIdwithLock(productId, undefined);

                // then
                expect(result).toEqual(mockProduct);
            });
        });
        describe('실패 케이스', () => {
            it('상품이 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findByIdwithLock').mockResolvedValueOnce(null);
                const productId = 1;

                // when
                const result = await service.findByIdwithLock(productId, undefined);

                // then
                expect(result).toBeNull();
            });
        });
    });

    describe('decreaseStock: 상품 재고 감소 테스트', () => {
        describe('성공 케이스', () => {
            it('올바른 상품 ID와 재고 감소 수량이 주어지면 상품 재고가 감소한다', async () => {
                // given
                const productId = 1;
                const quantity = 1;
                const updatedProduct = { ...mockProduct, stock: mockProduct.stock - quantity };
                jest.spyOn(repository, 'decreaseStock').mockResolvedValue(updatedProduct);

                // when
                const result = await service.decreaseStock(productId, quantity, undefined);

                // then
                expect(result).toEqual(updatedProduct);
            });
        });

        describe('실패 케이스', () => {
            it('재고 감소 수량이 0이면 BadRequestException을 발생시킨다', async () => {
                // given
                const quantity = 0;

                // when & then
                expect(() => commonValidator.validateProductQuantity(quantity)).toThrow(
                    BadRequestException,
                );
            });

            it('재고 감소 수량이 음수이면 BadRequestException을 발생시킨다', async () => {
                // given
                const quantity = -1;

                // when & then
                expect(() => commonValidator.validateProductQuantity(quantity)).toThrow(
                    BadRequestException,
                );
            });
        });
    });

    describe('findProducts: 상품 목록 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품 목록을 조회하고 페이지 정보를 반환한다', async () => {
                // given
                const page = 1;
                const limit = 10;

                // when
                const result = await service.findProducts(page, limit);

                // then
                expect(result).toEqual(mockProducts);
            });
        });
        describe('실패 케이스', () => {
            it('페이지 번호가 0 이하인 경우 에러를 반환한다', async () => {
                // given
                const page = 0;

                // when & then
                expect(() => commonValidator.validatePage(page)).toThrow(BadRequestException);
            });
            it('페이지당 항목 수(limit)가 0 이하인 경우 에러를 반환한다', async () => {
                // given
                const limit = 0;

                // when & then
                expect(() => commonValidator.validateLimit(limit)).toThrow(BadRequestException);
            });
        });
    });
});
