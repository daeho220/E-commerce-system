export interface TopSellingProductDto {
    id: number;
    product_name: string;
    price: number;
    stock: number;
    total_quantity: number;
    total_amount: number;
    order_count: number;
}

export interface TopSellingProductsDto {
    products: TopSellingProductDto[];
    start_date: string;
    end_date: string;
}
