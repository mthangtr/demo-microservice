import {Inject, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Cart} from './schemas/cart.schema';
import {CreateCartDto} from '@shared/dtos/create-cart.dto';
import {UpdateCartDto} from '@shared/dtos/update-cart.dto';
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from 'rxjs';
import {ProductTypes} from "@shared/types/product.interface";
import {logger} from "nx/src/utils/logger";
import {CartEvents} from './cart.events';
import {CheckoutEvent} from '@shared/types/checkout.interface';

interface ProductServiceGrpc {
    getProductsByIds(data: { ids: string[] }): any;
}

@Injectable()
export class CartService {
    private productService: ProductServiceGrpc;
    private readonly logger = new Logger(CartService.name);

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @Inject('PRODUCT_PACKAGE') private client: ClientGrpc,
        private cartEvents: CartEvents
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

    async checkout(cartId: string) {
        this.logger.log(`Processing checkout for cart: ${cartId}`);

        // Find the cart
        const cart = await this.cartModel.findById(cartId).exec();
        if (!cart) throw new NotFoundException('Cart not found');

        // Get cart with products details
        const cartWithProducts = await this.getCartWithProducts(cart.userId);

        // Create checkout event
        const checkoutEvent: CheckoutEvent = {
            cartId: cartId,
            userId: cart.userId,
            items: cartWithProducts.items.map((item, index) => ({
                product: item.product,
                quantity: cart.items[index].quantity
            })),
            totalPrice: cartWithProducts.totalPrice,
            timestamp: new Date()
        };

        // Emit checkout event
        await this.cartEvents.emitCheckoutEvent(checkoutEvent);

        this.logger.log(`Checkout completed for cart: ${cartId}`);

        return {
            success: true,
            message: 'Checkout initiated successfully',
            orderId: `order-${Date.now()}` // This would be replaced by actual order ID in a real system
        };
    }
}
