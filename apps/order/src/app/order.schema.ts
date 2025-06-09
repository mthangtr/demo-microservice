// order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({
        type: [{ productId: String, quantity: Number }],
        required: true,
    })
    items: { productId: string; quantity: number }[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ default: 'pending' })
    status: 'pending' | 'paid' | 'cancelled';
}

export const OrderSchema = SchemaFactory.createForClass(Order);
