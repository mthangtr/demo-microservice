import { Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createHttpOptions(baseUrl?: string): HttpModuleOptions {
    return {
      baseURL: baseUrl,
      timeout: this.configService.get<number>('HTTP_TIMEOUT', 30000),
      maxRedirects: 5,
      // Create proper HTTP agents for connection pooling
      httpAgent: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 100, // Maximum concurrent requests
        maxFreeSockets: 10, // Maximum idle sockets
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 100,
        maxFreeSockets: 10,
      })
    };
  }
}