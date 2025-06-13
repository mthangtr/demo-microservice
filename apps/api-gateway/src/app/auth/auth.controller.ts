import { Controller, Req, Res } from '@nestjs/common';
import { AuthProxyService } from './auth-proxy.service';
import { Public } from '../shared';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared";
import {ProxyRoute} from "../shared";


@Controller('auth')
@Public()
export class AuthController extends BaseProxyController {
    protected readonly routePrefix = 'auth';

    constructor(private readonly authProxyService: AuthProxyService) {
        super(authProxyService);
    }

    @ProxyRoute()
    async proxy(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }
}