import { Module } from '@nestjs/common';
import {CartModule} from "./carts/cart.module";
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CartModule,
  ]
})
export class AppModule {}