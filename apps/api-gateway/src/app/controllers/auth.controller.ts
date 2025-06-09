import { Controller, Post, Body, Req } from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';

@Controller('auth')
export class AuthController {
    constructor(private proxy: ProxyService) {}

    @Post('login')
    login(@Body() body: any) {
        return this.proxy.forward('POST', 'http://localhost:3001/api/auth/login', body);
    }

    @Post('register')
    register(@Body() body: any) {
        return this.proxy.forward('POST', 'http://localhost:3001/api/auth/register', body);
    }
}
