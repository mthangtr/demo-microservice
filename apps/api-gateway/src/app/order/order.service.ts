import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared";

@Injectable()
export class OrderProxyService extends BaseProxyService {
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/orders';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService, 'order');
    this.baseUrl = this.configService.get<string>('ORDER_SERVICE_URL', '');
  }
}
