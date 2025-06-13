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
    
    // Pre-compile headers filter
    private excludeHeaders: Set<string>;

    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly serviceType: string,
        circuitBreakerConfig?: Partial<CircuitBreakerConfig>
    ) {
        this.logger = new Logger(this.constructor.name);
        this.circuitBreaker = new CircuitBreakerService(this.serviceType, circuitBreakerConfig);
        
        // Pre-compile headers filter
        this.excludeHeaders = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);
    }

    async forwardRequest(req: Request, path?: string): Promise<ProxyResponse<any>> {
            return await this.circuitBreaker.execute(async () => {
                return await this.makeRequest(req, path);
            });
    }

    async makeRequest(req: Request, path?: string): Promise<ProxyResponse<any>> {
        const targetUrl = this.buildTargetUrl(req, path);
        const filteredHeaders = this.filterHeaders(req.headers);

        if (req['user'] && !req['_userDataString']) {
            req['_userDataString'] = JSON.stringify(req['user']);
        }
        if (req['_userDataString']) {
            filteredHeaders['X-User-Data'] = req['_userDataString'];
        }

        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    method: req.method as any,
                    url: targetUrl,
                    data: req.body,
                    timeout: 30000,
                    headers: filteredHeaders,
                    validateStatus: () => true,
                })
            );

            if (response.status >= 500) {
                const error = new Error(`Service returned ${response.status}`);
                error['response'] = response;
                throw error;
            }

            return {
                status: response.status,
                data: response.data,
                headers: response.headers
            };
        } catch (err) {
            // ✅ Rất quan trọng: throw lại để circuit breaker bắt được
            this.logger.warn(`Request to ${targetUrl} failed: ${err.message}`);
            throw err;
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
        
        for (const key in headers) {
            if (!this.excludeHeaders.has(key.toLowerCase())) {
                filteredHeaders[key] = headers[key];
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