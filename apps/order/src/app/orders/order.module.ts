import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderListener } from './order.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [OrderController, OrderListener],
  providers: [OrderService],
})
export class OrderModule {}
