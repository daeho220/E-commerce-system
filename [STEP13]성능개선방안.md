## 성능 개선 방안

### 1. 성능 개선 필요 로직

-   대상 : 인기 상품 조회
-   이유
    -   복잡한 집계 연산: 여러 테이블 조인, 그룹화, 정렬 연산 수행
    -   대량 데이터 처리: 판매 통계 데이터가 많을 경우 성능 저하
    -   빈번한 조회 요청: 인기 상품 조회는 자주 발생하는 요청
-   필요성
    -   데이터베이스 부하 감소
    -   응답 시간 단축

### 2. 성능 개선 방안

-   Redis 캐싱 적용

    -   아래와 같이 서비스 레이어의 메소드 레벨에 캐싱 적용 혹은 인터셉터를 통해 컨트롤러에서 캐싱 적용을 하게 된다면, 캐시가 존재하는 경우 DB에 접근을 할 필요가 없어진다. 따라서, DB의 부하가 감소하고, 응답 시간이 단축된다.

        ```typescript
            async findTop5SellingProductsIn3Days(): Promise<TopSellingProductsDto> {
                const endDate = new Date();
                const startDate = new Date(endDate);
                startDate.setDate(endDate.getDate() - 3);
                const limit = 5;

                try {
                    const cacheKey = `top_products:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
                    const cachedResult = await this.redis.get(cacheKey);
                    if (cachedResult) {
                        return JSON.parse(cachedResult);
                    }

                    const products = await this.productRepository.findTop5SellingProductsIn3Days(
                        startDate,
                        endDate,
                        limit,
                    );

                    const result = {
                        products: products.map((p) => ({
                            id: p.id,
                            product_name: p.product_name,
                            price: p.price,
                            stock: p.stock,
                            total_quantity: Number(p.total_quantity),
                            total_amount: Number(p.total_amount),
                            order_count: Number(p.order_count),
                        })),
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0],
                    };

                    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

                    return result;
                } catch (error) {
                    ...
                }
            }
        ```
