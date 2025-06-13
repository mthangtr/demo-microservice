import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import {JwtAuthGuard} from './shared';
import { HttpConfigService } from './shared/http';
import jwtConfig from './shared/jwt/jwt.config';
import { RolesGuard } from 'libs/shared/src/auth/roles.guard';
import {ProxyModule} from "./shared/proxy.module";

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: `.env`,
      load: [jwtConfig]
    }),
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
      ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    HttpConfigService,
  ],

})
export class AppModule {}