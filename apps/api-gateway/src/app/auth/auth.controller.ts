import { Controller, Req, Res } from '@nestjs/common';
import { AuthProxyService } from './auth.service';
import { Public } from '../shared';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared/controllers";
import {ProxyRoute} from "../shared/decorators";


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