import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {BaseProxyService} from "../shared";

@Injectable()
export class AuthProxyService extends BaseProxyService {
  protected readonly baseUrl: string;
  protected readonly pathPrefix = '/auth';

  constructor(
    protected readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpService, 'auth', {
      failureThreshold: 2,
      successThreshold: 2,
      timeout: 15000,
      monitoringPeriod: 30000
    });
    this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001/api');
    this.logger.log(`Auth service URL configured as: ${this.baseUrl}`);
  }

}