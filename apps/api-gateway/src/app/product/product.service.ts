import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared/services";

@Injectable()
export class ProductService extends BaseProxyService {
  protected readonly serviceType = 'product';
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/products';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService);
    this.baseUrl = this.configService.get<string>('PRODUCT_SERVICE_URL', 'http://localhost:3002/api');
    this.logger.log(`Product service URL configured as: ${this.baseUrl}`);
  }

}
