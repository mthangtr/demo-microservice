import { Controller, All, Req, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { Request, Response } from 'express';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @All('/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const resp = await this.cartService.forwardRequest(req);
    res.status(resp.status).send(resp.data);
  }
}
