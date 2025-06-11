/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CONSUMER_GROUPS } from '@shared/kafka/kafka-topics';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: {
        groupId: CONSUMER_GROUPS.ORDER,
        allowAutoTopicCreation: true,
      },
    },
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3004;

  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log('🚀 Kafka consumer is running');
}

bootstrap();
