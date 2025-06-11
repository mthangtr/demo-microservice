import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { BaseProxyService } from '../shared/services/base-proxy.service';

@Injectable()
export class CartService extends BaseProxyService {
  protected readonly serviceType = 'cart';
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/carts';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService);
    this.baseUrl = this.configService.get<string>('CART_SERVICE_URL', '');
  }

  async forwardRequest(req: Request) {
    return super.forwardRequest(req);
  }
}
