//app/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    image: string;

    @Prop({ default: 0 })
    inStock: number;

    @Prop()
    category: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
