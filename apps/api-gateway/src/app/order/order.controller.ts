import { Controller, All, Req, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request, Response } from 'express';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @All('/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const resp = await this.orderService.forwardRequest(req);
    res.status(resp.status).send(resp.data);
  }
}
