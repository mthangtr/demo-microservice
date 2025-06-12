// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'user' })
    role: 'customer' | 'admin';

    @Prop({ default: 0 })
    balance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
