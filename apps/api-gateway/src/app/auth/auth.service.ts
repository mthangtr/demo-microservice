import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { BaseProxyService } from '../shared/services/base-proxy.service';

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

  async forwardRequest(req: Request, path: string) {
    return super.forwardRequest(req, path);
  }
}