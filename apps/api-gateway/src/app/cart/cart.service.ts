import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared/services";

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

  // Phương thức forwardRequest đã được kế thừa từ BaseProxyService
}
