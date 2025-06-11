import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export abstract class BaseProxyService {
  protected readonly logger: Logger;
  protected abstract readonly serviceType: string;
  protected abstract readonly baseUrl: string;
  protected abstract readonly pathPrefix: string;

  constructor(protected readonly httpService: HttpService) {
    this.logger = new Logger(this.constructor.name);
  }

  async forwardRequest(req: Request, path?: string) {
    try {
      // Prepare the request URL and path
      const targetUrl = this.buildTargetUrl(req, path);

      // Filter headers and add user data
      const filteredHeaders = this.filterHeaders(req.headers);
      if (req['user']) {
        filteredHeaders['X-User-Data'] = JSON.stringify(req['user']);
      }

      // Only log in non-production environments or for significant requests
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`Forwarding ${this.serviceType} request: ${req.method} ${targetUrl}`);
      }

      // Forward the request
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url: targetUrl,
          data: req.body,
          timeout: 30000, // 30 seconds timeout
          maxBodyLength: 50 * 1024 * 1024, // 50MB
          maxContentLength: 50 * 1024 * 1024, // 50MB
          headers: filteredHeaders,
          validateStatus: () => true, // Don't throw on any status code
        })
      );

      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      // Log error at appropriate level
      this.logger.error(`${this.serviceType} service error: ${error.message}`);

      // Handle specific error cases
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return {
          status: 503,
          data: { message: `${this.serviceType} service is unavailable`, error: error.message },
        };
      }

      if (error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
      } else if (error.request) {
        return {
          status: 504,
          data: { message: 'Gateway Timeout', error: `No response from ${this.serviceType} service` },
        };
      }

      return {
        status: 500,
        data: { message: 'Internal server error', error: error.message },
      };
    }
  }

  protected buildTargetUrl(req: Request, path?: string): string {
    if (path !== undefined) {
      // Format the path properly
      if (path === '') {
        path = '/';
      } else if (!path.startsWith('/')) {
        path = '/' + path;
      }

      // Apply service-specific path prefix
      const modifiedPath = this.pathPrefix + path;
      return this.baseUrl.replace(/\/$/, '') + modifiedPath;
    } else {
      // Just replace /api prefix from original URL
      return req.originalUrl.replace('/api', '');
    }
  }

  protected filterHeaders(headers: any): Record<string, string | string[]> {
    const filteredHeaders: Record<string, string | string[]> = {};
    const excludeHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];

    for (const [key, value] of Object.entries(headers)) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        filteredHeaders[key] = value as string | string[];
      }
    }

    return filteredHeaders;
  }
}
