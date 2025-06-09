import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from '@shared/dtos/create-product.dto';
import { UpdateProductDto } from '@shared/dtos/update-product.dto';
import {GrpcMethod} from "@nestjs/microservices";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        return this.productModel.create(createProductDto);
    }

    async findAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productModel.findById(id).exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, {
            new: true,
        }).exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async remove(id: string): Promise<void> {
        const result = await this.productModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Product not found');
    }

    @GrpcMethod('ProductService', 'GetProductsByIds')
    async getProductsByIds(data: { ids: string[] }) {
        const products = await this.productModel.find({ _id: { $in: data.ids } });
        return { products };
    }

}
