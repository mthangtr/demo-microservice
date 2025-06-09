import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/jwt.util';

const PUBLIC_PATHS = [
    { method: 'POST', path: '/auth/login' },
    { method: 'POST', path: '/auth/register' },
];

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const rawPath = req.originalUrl.replace(/^\/api/, '');

        const isPublic = PUBLIC_PATHS.some(
            route => route.method === req.method && rawPath.startsWith(route.path),
        );

        if (isPublic) return next();

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            throw new UnauthorizedException('Invalid token');
        }

        // Attach user info to the request
        req['user'] = decoded;
        return next();
    }
}
