import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartProxyService } from './cart.service';
import { ProxyModule } from '../shared/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [CartController],
  providers: [CartProxyService],
  exports: [CartProxyService],
})
export class CartModule {}