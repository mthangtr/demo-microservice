import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CartEvents } from './cart.events';

@Module({
    imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ClientsModule.register([
            {
                name: 'PRODUCT_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    url: 'localhost:50051',
                    package: 'product',
                    protoPath: join(__dirname, '../../../libs/shared/protos/product.proto'),
                },
            },
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'cart-service',
                        brokers: ['localhost:9092'],
                    },
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                },
            },

        ]),
    ],
    controllers: [CartController],
    providers: [CartService, CartEvents],
})
export class CartModule {}
