import {Controller, All, Req, Res, Logger, Get} from '@nestjs/common';
import {Public} from '../shared/guards/jwt-auth.guard';
import {ProductService} from './product.service';
import {Request, Response} from 'express';

@Controller('products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);

    constructor(private readonly productService: ProductService) {
    }

    @Get() // Thêm route handler cụ thể cho GET /api/products
    @Public() // Đảm bảo route này có thể truy cập công khai
    async getAllProducts(@Req() req: Request, @Res() res: Response) {
        this.logger.log('GET /api/products handler called');
        return this.proxy(req, res);
    }

    @All('/*')
    async proxy(@Req() req: Request, @Res() res: Response) {
        try {
            // Extract the path from original URL without /api/products prefix
            const path = req.originalUrl.replace(/^\/api\/products/, '');

            const resp = await this.productService.forwardRequest(req, path);

            if (resp.headers) {
                // Forward appropriate headers from the product service response
                // Optimize header forwarding with a faster loop
                const headerEntries = Object.entries(resp.headers);
                for (let i = 0; i < headerEntries.length; i++) {
                    const [key, value] = headerEntries[i];
                    const lowerKey = key.toLowerCase();
                    if (lowerKey !== 'transfer-encoding' && lowerKey !== 'connection') {
                        if (typeof value === 'string' || Array.isArray(value)) {
                            res.setHeader(key, value);
                        }
                    }
                }
            }

            res.status(resp.status).send(resp.data);
        } catch (error) {
            this.logger.error(`Proxy error: ${error.message}`);
            res.status(500).send({message: 'Internal server error', error: error.message});
        }
    }
}
