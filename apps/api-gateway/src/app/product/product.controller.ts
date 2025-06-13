import { Controller, Req, Res } from '@nestjs/common';
import { ProductProxyService } from './product-proxy.service';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared";
import {ProxyRoute} from "../shared";
import { Roles, Role } from 'libs/shared/src/auth';

@Controller('products')
export class ProductController extends BaseProxyController {
    protected readonly routePrefix = 'products';

    constructor(private readonly productProxyService: ProductProxyService) {
        super(productProxyService);
    }

    @ProxyRoute('')
    @Roles(Role.ADMIN)
    async proxyGetAll(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }

}