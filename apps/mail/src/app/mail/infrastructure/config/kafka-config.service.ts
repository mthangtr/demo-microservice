import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Placeholder service for future Kafka configuration
 * Uncomment and implement when adding Kafka
 */
@Injectable()
export class KafkaConfigService {
  constructor(private configService: ConfigService) {}

  get brokers(): string[] {
    const brokersStr = this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';
    return brokersStr.split(',');
  }

  get clientId(): string {
    return this.configService.get<string>('KAFKA_CLIENT_ID') || 'mail-service';
  }

  get groupId(): string {
    return this.configService.get<string>('KAFKA_GROUP_ID') || 'mail-service-group';
  }

  get mailTopic(): string {
    return this.configService.get<string>('KAFKA_MAIL_TOPIC') || 'mail-topic';
  }
}
