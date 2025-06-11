import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  name: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  cartId: string;

  @Prop([OrderItem])
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
