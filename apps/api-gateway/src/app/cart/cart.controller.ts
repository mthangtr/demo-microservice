import { Controller, Req, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared/controllers";
import {ProxyRoute} from "../shared/decorators";

@Controller('carts')
export class CartController extends BaseProxyController {
  protected readonly routePrefix = 'carts';

  constructor(private readonly cartService: CartService) {
    super(cartService);
  }

  @ProxyRoute('items')
  async proxyGetCartItems(@Req() req: Request, @Res() res: Response) {
    return this.handleProxy(req, res);
  }

  @ProxyRoute()
  async proxy(@Req() req: Request, @Res() res: Response) {
    return this.handleProxy(req, res);
  }
}
