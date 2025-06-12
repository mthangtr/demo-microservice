/**
 * Mail Service with SMTP support and Kafka consumer
 */

import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CONSUMER_GROUPS } from '@shared/kafka/kafka-topics';

async function bootstrap() {
  dotenv.config();

  // Silence KafkaJS partitioner warning
  process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3005;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Kafka consumer configuration
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'mail-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        connectionTimeout: 10000
      },
      consumer: {
        groupId: 'mail-consumer', // Fixed group ID to avoid conflicts
        allowAutoTopicCreation: true
      },
    },
  });

  try {
    // Start microservice first
    await app.startAllMicroservices();
    Logger.log(`📬 Kafka consumer started with group: ${process.env.KAFKA_GROUP_ID || CONSUMER_GROUPS.MAIL}`);
  } catch (error) {
    Logger.error(`Failed to start Kafka consumer: ${error.message}`);
    Logger.log('Mail service will continue without Kafka consumer');
  }

  await app.listen(port);

  Logger.log(`🚀 Mail service is running on: http://localhost:${port}/${globalPrefix}`);
}

void bootstrap();
