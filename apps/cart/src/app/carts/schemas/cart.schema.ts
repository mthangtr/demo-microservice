// cart.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({
        type: [{ productId: String, quantity: Number }],
        default: [],
    })
    items: { productId: string; quantity: number }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
