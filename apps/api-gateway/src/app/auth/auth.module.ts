import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProxyService } from './auth.service';
import { ProxyModule } from '../shared/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [AuthController],
  providers: [AuthProxyService],
  exports: [AuthProxyService],
})
export class AuthModule {}