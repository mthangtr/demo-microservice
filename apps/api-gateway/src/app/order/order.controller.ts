import { Controller, Req, Res } from '@nestjs/common';
import { OrderProxyService } from './order.service';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared/controllers";
import {ProxyRoute} from "../shared/decorators";

@Controller('orders')
export class OrderController extends BaseProxyController {
  protected readonly routePrefix = 'orders';

  constructor(private readonly orderProxyService: OrderProxyService) {
    super(orderProxyService);
  }

  @ProxyRoute()
  async proxy(@Req() req: Request, @Res() res: Response) {
    return this.handleProxy(req, res);
  }
}
