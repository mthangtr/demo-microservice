import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ProxyService } from '../services/proxy.service';
import { CreateProductDto } from '@shared/dtos/create-product.dto';

@Controller('products')
export class ProductController {
    constructor(private readonly proxy: ProxyService) {}

    @Post()
    create(@Body() body: CreateProductDto) {
        return this.proxy.forward('POST', 'http://localhost:3002/api/products', body);
    }

    @Get()
    getAll() {
        return this.proxy.forward('GET', 'http://localhost:3002/api/products');
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.proxy.forward('GET', `http://localhost:3002/api/products/${id}`);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.proxy.forward('PUT', `http://localhost:3002/api/products/${id}`, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.proxy.forward('DELETE', `http://localhost:3002/api/products/${id}`);
    }
}
