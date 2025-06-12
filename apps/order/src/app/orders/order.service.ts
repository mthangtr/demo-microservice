import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) {}

  async createFromCheckout(checkoutData: any): Promise<Order> {
    this.logger.log(`Creating order for user: ${checkoutData.userId}`);

    try {
      const order = new this.orderModel({
        userId: checkoutData.userId,
        cartId: checkoutData.cartId,
        items: checkoutData.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price || 0,
          name: item.name || 'Product'
        })),
        totalAmount: checkoutData.totalPrice,
        status: 'pending'
      });

      await order.save();
      this.logger.log(`Order created with ID: ${order._id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).exec();
  }
}
