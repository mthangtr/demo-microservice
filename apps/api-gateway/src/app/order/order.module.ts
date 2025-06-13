import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderProxyService } from './order.service';
import { ProxyModule } from '../shared/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [OrderController],
  providers: [OrderProxyService],
  exports: [OrderProxyService],
})
export class OrderModule {}