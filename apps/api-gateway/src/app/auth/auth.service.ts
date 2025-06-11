import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared/services";

@Injectable()
export class AuthService extends BaseProxyService {
  protected readonly serviceType = 'auth';
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/auth';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService);
    this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001/api');
    this.logger.log(`Auth service URL configured as: ${this.baseUrl}`);
  }

  // Phương thức forwardRequest đã được kế thừa từ BaseProxyService
}