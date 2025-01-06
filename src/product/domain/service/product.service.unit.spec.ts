import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import {
    IProductRepository,
    IPRODUCT_REPOSITORY,
} from '../../infrastructure/product.repository.interface';
import { product as PrismaProduct } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
describe('ProductService', () => {
    let service: ProductService;
    let repository: IProductRepository;

    const mockProduct: PrismaProduct = {
        id: 1,
        product_name: 'Test Product',
        price: 1000,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
        stock: 100,
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
                    },
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        repository = module.get<IProductRepository>(IPRODUCT_REPOSITORY);
    });

    describe('findById: 상품 조회 테스트', () => {
        describe('성공 케이스', () => {
            it('상품이 존재하면 상품 정보와 재고를 반환한다', async () => {
                // given
                const productId = 1;

                // when
                const result = await service.findById(productId);

                // then
                expect(result).toEqual(mockProduct);
                expect(repository.findById).toHaveBeenCalledWith(productId);
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
                const productId = 1;

                // when
                const result = await service.findByIdwithLock(productId);

                // then
                expect(result).toEqual(mockProduct);
                expect(repository.findByIdwithLock).toHaveBeenCalledWith(productId);
            });
        });
        describe('실패 케이스', () => {
            it('상품이 존재하지 않으면 null을 반환한다', async () => {
                jest.spyOn(repository, 'findByIdwithLock').mockResolvedValueOnce(null);
                const productId = 1;

                // when
                const result = await service.findByIdwithLock(productId);

                // then
                expect(result).toBeNull();
                expect(repository.findByIdwithLock).toHaveBeenCalledWith(productId);
            });
            it('상품 ID가 0이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 0;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 음수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = -1;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 문자열이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 'test' as any;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 실수이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = 1.1;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 undefined이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = undefined as any;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
            it('상품 ID가 null이면 상품 조회시 BadRequestException을 발생시킨다', async () => {
                // given
                const productId = null as any;

                // when
                await expect(service.findByIdwithLock(productId)).rejects.toThrow(
                    BadRequestException,
                );
            });
        });
    });
});
