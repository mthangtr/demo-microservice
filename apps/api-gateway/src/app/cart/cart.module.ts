import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProxyModule } from '../shared/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}