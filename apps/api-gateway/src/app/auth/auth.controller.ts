import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../shared/guards/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
@Public()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    @All('/*')
    async proxy(@Req() req: Request, @Res() res: Response) {
        try {
            this.logger.debug(`Received request: ${req.method} ${req.originalUrl}`);

            // Extract the path from original URL without /api/auth prefix
            // For /api/auth/login → /login
            const path = req.originalUrl.replace(/^\/api\/auth/, '');
            this.logger.debug(`Extracted path: ${path}`);

            const resp = await this.authService.forwardRequest(req, path);

            if (resp.headers) {
                // Forward appropriate headers from the auth service response
                Object.entries(resp.headers).forEach(([key, value]) => {
                    // Skip headers that shouldn't be forwarded
                    if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                        // @ts-ignore
                        res.setHeader(key, value);
                    }
                });
            }

            res.status(resp.status).send(resp.data);
        } catch (error) {
            this.logger.error(`Proxy error: ${error.message}`, error.stack);
            res.status(500).send({ message: 'Internal server error', error: error.message });
        }
    }
}