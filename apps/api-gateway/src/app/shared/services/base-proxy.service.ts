import {Injectable, Logger} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {Request} from 'express';
import {firstValueFrom} from 'rxjs';
import {CircuitBreakerConfig, ProxyResponse} from '../interfaces';
import {CircuitBreakerService} from "./circuit-breaker.service";

@Injectable()
export abstract class BaseProxyService {
    protected readonly logger: Logger;
    protected abstract readonly baseUrl: string;
    protected abstract readonly pathPrefix: string;
    protected readonly circuitBreaker: CircuitBreakerService;

    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly serviceType: string,
        circuitBreakerConfig?: Partial<CircuitBreakerConfig>
    ) {
        this.logger = new Logger(this.constructor.name);
        this.circuitBreaker = new CircuitBreakerService(this.serviceType, circuitBreakerConfig);
    }

    async forwardRequest(req: Request, path?: string): Promise<ProxyResponse<any>> {
        try {
            // Sử dụng Circuit Breaker để bảo vệ request
            return await this.circuitBreaker.execute(async () => {
                return await this.makeRequest(req, path);
            });
        } catch (error) {
            // Circuit Breaker sẽ throw error nếu circuit OPEN
            if (error.message.includes('Circuit Breaker OPEN')) {
                this.logger.warn(`Request blocked by Circuit Breaker for ${this.serviceType}`);
                return {
                    status: 503,
                    data: {
                        message: `${this.serviceType} service is temporarily unavailable`,
                        error: 'Circuit breaker is open',
                        circuitBreakerMetrics: this.circuitBreaker.getMetrics()
                    }
                };
            }
            throw error;
        }
    }


    async makeRequest(req: Request, path?: string): Promise<ProxyResponse<any>> {
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

            // Chuyển đổi headers thành định dạng phù hợp
            const typedHeaders: Record<string, string | string[]> = {};
            if (response.headers) {
                Object.entries(response.headers).forEach(([key, value]) => {
                    if (value !== undefined && (typeof value === 'string' || Array.isArray(value))) {
                        typedHeaders[key] = value;
                    } else if (typeof value === 'number') {
                        typedHeaders[key] = String(value);
                    }
                });
            }

            const isSuccess = response.status >= 200 && response.status < 500; // 5xx là server error, cần trigger circuit breaker

            if (!isSuccess) {
                // Throw error để Circuit Breaker biết đây là failure
                const error = new Error(`Service returned ${response.status}`);
                error['response'] = response;
                throw error;
            }

            return {
                status: response.status,
                data: response.data,
                headers: typedHeaders
            };
        } catch (error) {
            // Log error at appropriate level
            this.logger.error(`${this.serviceType} service error: ${error.message}`);

            // Handle specific error cases
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return {
                    status: 503,
                    data: {message: `${this.serviceType} service is unavailable`, error: error.message},
                };
            }

            if (error.response) {
                // Chuyển đổi headers thành định dạng phù hợp
                const typedHeaders: Record<string, string | string[]> = {};
                if (error.response.headers) {
                    Object.entries(error.response.headers).forEach(([key, value]) => {
                        if (value !== undefined && (typeof value === 'string' || Array.isArray(value))) {
                            typedHeaders[key] = value;
                        } else if (typeof value === 'number') {
                            typedHeaders[key] = String(value);
                        }
                    });
                }

                return {
                    status: error.response.status,
                    data: error.response.data,
                    headers: typedHeaders
                };
            }
            throw error;
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

    /**
     * Lấy metrics của Circuit Breaker để monitoring
     */
    getCircuitBreakerMetrics() {
        return this.circuitBreaker.getMetrics();
    }

    /**
     * Reset Circuit Breaker - có thể dùng cho admin endpoint
     */
    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }

}
