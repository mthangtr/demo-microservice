import * as dotenv from 'dotenv';
import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { CONSUMER_GROUPS } from '@shared/kafka/kafka-topics';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3002;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051',
      package: 'product',
      protoPath: join(__dirname, '../../../libs/shared/protos/product.proto'),
    },
  });
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: { 
        groupId: CONSUMER_GROUPS.PRODUCT,
        allowAutoTopicCreation: true,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`🚀 gRPC is running on 0.0.0.0:50051`);
  Logger.log('🚀 Kafka consumer is running');
}
void bootstrap();