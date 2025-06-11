import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { BaseProxyService } from '../shared/services/base-proxy.service';

@Injectable()
export class OrderService extends BaseProxyService {
  protected readonly serviceType = 'order';
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/orders';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService);
    this.baseUrl = this.configService.get<string>('ORDER_SERVICE_URL', '');
  }

  async forwardRequest(req: Request) {
    return super.forwardRequest(req);
  }
}
