import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
    imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ClientsModule.register([
            {
                name: 'PRODUCT_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    url: 'localhost:50051',
                    package: 'product',
                    protoPath: join(__dirname, './protos/product.proto'),
                },
            },
        ]),
    ],
    controllers: [CartController],
    providers: [CartService],
})
export class CartModule {}
