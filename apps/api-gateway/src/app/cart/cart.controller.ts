import {Controller, Req, Res} from '@nestjs/common';
import {CartProxyService} from './cart-proxy.service';
import {Request, Response} from 'express';
import {BaseProxyController} from "../shared";
import {ProxyRoute} from "../shared";

@Controller('carts')
export class CartController extends BaseProxyController {
    protected readonly routePrefix = 'carts';

    constructor(private readonly cartProxyService: CartProxyService) {
        super(cartProxyService);
    }

    @ProxyRoute('items')
    async proxyGetCartItems(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }

    @ProxyRoute(':id/checkout')
    async proxyCheckout(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }

    @ProxyRoute()
    async proxy(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }
}
