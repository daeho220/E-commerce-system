import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CartItemDto } from '../presentation/dto/cart-item.dto';
import { AddToCartDto } from '../presentation/dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from '../presentation/dto/update-cart-quantity.dto';
import { RemoveFromCartDto } from '../presentation/dto/remove-from-cart.dto';

@ApiTags('Carts (Mock)')
@Controller('carts')
export class CartsMockController {
    private cartItems: CartItemDto[] = [];

    @Get(':userId')
    @ApiOperation({
        summary: '장바구니 조회',
        description: '사용자가 보유한 장바구니 목록을 조회합니다.',
    })
    @ApiParam({ name: 'userId', required: true, description: '사용자 ID' })
    @ApiResponse({ status: 200, description: '장바구니 조회 성공', type: [CartItemDto] })
    @ApiResponse({ status: 404, description: '장바구니를 찾을 수 없음' })
    getCartItems(@Param('userId') userId: number): CartItemDto[] {
        const userIdNumber = Number(userId);
        const userCartItems = this.cartItems.filter((item) => item.userId === userIdNumber);

        if (userCartItems.length === 0) {
            throw new NotFoundException(`ID가 ${userId}인 사용자의 장바구니를 찾을 수 없습니다.`);
        }

        return userCartItems;
    }

    @Post('add')
    @ApiOperation({
        summary: '장바구니 내 상품 추가',
        description: '장바구니에 상품을 추가합니다.',
    })
    @ApiBody({ type: AddToCartDto })
    @ApiResponse({ status: 201, description: '장바구니 추가 성공', type: CartItemDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    addToCart(@Body() addToCartDto: AddToCartDto): CartItemDto {
        const existingItem = this.cartItems.find(
            (item) =>
                item.userId === addToCartDto.userId && item.productId === addToCartDto.productId,
        );

        if (existingItem) {
            throw new BadRequestException('이미 장바구니에 존재하는 상품입니다.');
        }

        const newItem: CartItemDto = {
            cartItemsId: this.cartItems.length + 1,
            userId: addToCartDto.userId,
            productId: addToCartDto.productId,
            quantity: addToCartDto.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.cartItems.push(newItem);
        return newItem;
    }

    @Patch('quantity/update')
    @ApiOperation({
        summary: '장바구니 내 상품 수량 변경',
        description: '장바구니에서 상품의 수량을 변경합니다.',
    })
    @ApiBody({ type: UpdateCartQuantityDto })
    @ApiResponse({ status: 200, description: '수량 변경 성공', type: CartItemDto })
    @ApiResponse({ status: 404, description: '장바구니 항목을 찾을 수 없음' })
    updateCartQuantity(@Body() updateCartQuantityDto: UpdateCartQuantityDto): CartItemDto {
        const item = this.cartItems.find(
            (cartItem) =>
                cartItem.userId === updateCartQuantityDto.userId &&
                cartItem.productId === updateCartQuantityDto.productId,
        );

        if (!item) {
            throw new NotFoundException('장바구니에 해당 상품이 존재하지 않습니다.');
        }

        item.quantity = updateCartQuantityDto.quantity;
        item.updatedAt = new Date();
        return item;
    }

    @Delete('remove')
    @ApiOperation({
        summary: '장바구니 내 상품 삭제',
        description: '장바구니에서 상품을 삭제합니다.',
    })
    @ApiBody({ type: RemoveFromCartDto })
    @ApiResponse({ status: 200, description: '상품 삭제 성공' })
    @ApiResponse({ status: 404, description: '장바구니 항목을 찾을 수 없음' })
    removeFromCart(@Body() removeFromCartDto: RemoveFromCartDto): void {
        const initialLength = this.cartItems.length;
        this.cartItems = this.cartItems.filter(
            (item) =>
                item.userId !== removeFromCartDto.userId ||
                !removeFromCartDto.productIds.includes(item.productId),
        );

        if (this.cartItems.length === initialLength) {
            throw new NotFoundException('장바구니에서 삭제할 상품을 찾을 수 없습니다.');
        }
    }
}
