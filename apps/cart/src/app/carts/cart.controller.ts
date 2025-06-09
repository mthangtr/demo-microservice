import {Controller, Get, Post, Put, Delete, Param, Body} from '@nestjs/common';
import {CartService} from './cart.service';
import {CreateCartDto} from '@shared/dtos/create-cart.dto';
import {UpdateCartDto} from '@shared/dtos/update-cart.dto';

@Controller('carts')
export class CartController {
    constructor(private readonly cartService: CartService) {
    }

    @Post()
    create(@Body() dto: CreateCartDto) {
        return this.cartService.create(dto);
    }

    @Get()
    findAll() {
        return this.cartService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cartService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
        return this.cartService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cartService.remove(id);
    }

    @Get('items/:userId')
    async getCart(@Param('userId') userId: string) {
        return this.cartService.getCartWithProducts(userId);
    }
}
