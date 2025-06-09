import {Controller, Post, Body, Req, Headers, Get} from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('carts')
export class CartController {
    constructor(private readonly proxy: ProxyService) {}

    @Post()
    addItem(@Body() body: any) {
        return this.proxy.forward('POST', 'http://localhost:3003/api/carts', body);
    }

    @Get('items/:userId')
    getCartItems(@Req() req: any) {
        const userId = req.params.userId;
        return this.proxy.forward('GET', `http://localhost:3003/api/carts/items/${userId}`, null);
    }
}
