import { Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

export abstract class BaseProxyController {
  protected readonly logger: Logger;
  protected abstract readonly routePrefix: string;

  constructor(protected readonly proxyService: any) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Xử lý chung cho tất cả requests proxy
   * @param req Request từ client
   * @param res Response để trả về client
   */
  async handleProxy(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract the path from original URL without /api/{routePrefix} prefix
      const path = req.originalUrl.replace(new RegExp(`^/api/${this.routePrefix}`), '');

      // Call the proxy service to forward the request
      const resp = await this.proxyService.forwardRequest(req, path);

      // Forward appropriate headers from the response
      if (resp.headers) {
        this.forwardResponseHeaders(resp.headers, res);
      }

      // Thêm API Gateway header
      res.setHeader('X-API-Gateway', 'true');

      // Set status and send data
      res.status(resp.status).send(resp.data);
    } catch (error) {
      this.logger.error(`Proxy error: ${error.message}`);
      res.status(500).send({
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Forward headers từ microservice response
   * @param headers Headers từ service response
   * @param res Response object để set headers
   */
  protected forwardResponseHeaders(headers: any, res: Response) {
    if (!headers) return;

    // Các headers không nên forward
    const excludeHeaders = ['transfer-encoding', 'connection'];

    // Sử dụng for-loop hiệu quả hơn forEach
    const headerEntries = Object.entries(headers);
    for (let i = 0; i < headerEntries.length; i++) {
      const [key, value] = headerEntries[i];
      if (!key || value === undefined) continue;

      const lowerKey = key.toLowerCase();
      if (!excludeHeaders.includes(lowerKey)) {
        if (typeof value === 'string' || Array.isArray(value)) {
          res.setHeader(key, value);
        } else if (typeof value === 'number') {
          // Chuyển đổi số thành chuỗi
          res.setHeader(key, String(value));
        }
      }
    }
  }
}
