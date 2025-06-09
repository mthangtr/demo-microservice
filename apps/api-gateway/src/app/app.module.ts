import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './services/proxy.service';
import { AuthController } from './controllers/auth.controller';
import { ProductController } from './controllers/product.controller';
import { CartController } from './controllers/cart.controller';
import { JwtAuthMiddleware } from './middlewares/jwt-auth.middleware';

@Module({
  imports: [HttpModule],
  controllers: [AuthController, ProductController, CartController],
  providers: [ProxyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(JwtAuthMiddleware)
        .forRoutes('*');
  }
}
