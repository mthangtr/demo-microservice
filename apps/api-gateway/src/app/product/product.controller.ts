import { Controller, Req, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { Request, Response } from 'express';
import {BaseProxyController} from "../shared/controllers";
import {ProxyRoute} from "../shared/decorators";
import { Roles, Role } from 'libs/shared/src/auth';

@Controller('products')
export class ProductController extends BaseProxyController {
    protected readonly routePrefix = 'products';

    constructor(private readonly productService: ProductService) {
        super(productService);
    }

    @ProxyRoute('')
    @Roles(Role.ADMIN)
    async proxyGetAll(@Req() req: Request, @Res() res: Response) {
        return this.handleProxy(req, res);
    }

}