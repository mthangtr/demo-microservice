import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductProxyService } from './product-proxy.service';
import { ProxyModule } from '../shared/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [ProductController],
  providers: [ProductProxyService],
  exports: [ProductProxyService],
})
export class ProductModule {}
