import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductListener } from './product.listener';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ],
    controllers: [ProductController, ProductListener],
    providers: [ProductService],
})
export class ProductModule {}
