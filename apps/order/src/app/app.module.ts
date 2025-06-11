import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {OrderModule} from "./orders/order.module";

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI),
        OrderModule
    ],
})
export class AppModule {
}
