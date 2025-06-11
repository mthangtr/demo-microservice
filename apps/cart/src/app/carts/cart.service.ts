import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Cart} from './schemas/cart.schema';
import {CreateCartDto} from '@shared/dtos/create-cart.dto';
import {UpdateCartDto} from '@shared/dtos/update-cart.dto';
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from 'rxjs';
import {ProductTypes} from "@shared/types/product.interface";
import {logger} from "nx/src/utils/logger";

interface ProductServiceGrpc {
    getProductsByIds(data: { ids: string[] }): any;
}

@Injectable()
export class CartService {
    private productService: ProductServiceGrpc;

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @Inject('PRODUCT_PACKAGE') private client: ClientGrpc
    ) {
    }

    onModuleInit() {
        this.productService = this.client.getService<ProductServiceGrpc>('ProductService');
    }

    async create(createCartDto: CreateCartDto): Promise<Cart> {
        return this.cartModel.create(createCartDto);
    }

    async findAll(): Promise<Cart[]> {
        return this.cartModel.find().exec();
    }

    async findOne(id: string): Promise<Cart> {
        const cart = await this.cartModel.findById(id).exec();
        if (!cart) throw new NotFoundException('Cart not found');
        return cart;
    }

    async update(id: string, dto: UpdateCartDto): Promise<Cart> {
        const cart = await this.cartModel.findByIdAndUpdate(id, dto, {new: true}).exec();
        if (!cart) throw new NotFoundException('Cart not found');
        return cart;
    }

    async remove(id: string): Promise<void> {
        const result = await this.cartModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Cart not found');
    }

    async getCartWithProducts(userId: string) {
        const cart = await this.cartModel.findOne({userId});
        if (!cart) throw new NotFoundException('Cart not found');

        const ids = cart.items.map(item => item.productId);
        const response = await lastValueFrom(this.productService.getProductsByIds({ids})) as {
            products: ProductTypes[]
        };
        const products = response.products;

        logger.log(products);

        const items = cart.items.map(item => {
            const product = products.find(p => p._id === item.productId);
            return {
                product,
                quantity: item.quantity,
                total: product.price * item.quantity,
            };
        });

        const totalPrice = items.reduce((acc, cur) => acc + cur.total, 0);

        return {
            userId: cart.userId,
            items,
            totalPrice,
        };
    }
}
