/**
 * Mail Service with SMTP support
 * Simplified version without gRPC - ready for Kafka implementation
 */

import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3005;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Future Kafka implementation will be added here

  await app.listen(port);
  Logger.log(`🚀 Mail service is running on: http://localhost:${port}/${globalPrefix}`);
}

void bootstrap();
