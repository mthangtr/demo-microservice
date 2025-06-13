import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared";

@Injectable()
export class CartProxyService extends BaseProxyService {
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/carts';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService, 'cart');
    this.baseUrl = this.configService.get<string>('CART_SERVICE_URL', '');
  }

}
