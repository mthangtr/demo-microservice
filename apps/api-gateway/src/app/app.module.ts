import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { HttpConfigService } from './shared/http/http-config.service';
import jwtConfig from './shared/jwt/jwt.config';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    HttpConfigService,
  ],
})
export class AppModule {}