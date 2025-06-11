import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpConfigService } from './http/http-config.service';

/**
 * Module chung cung cấp các dependency cho tất cả các proxy services
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    ConfigModule,
  ],
  exports: [HttpModule, ConfigModule],
})
export class ProxyModule {}
