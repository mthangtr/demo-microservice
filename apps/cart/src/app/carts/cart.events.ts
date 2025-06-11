import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CheckoutEvent } from '@shared/types/checkout.interface';
import { KAFKA_TOPICS } from '@shared/kafka/kafka-topics';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CartEvents {
  private readonly logger = new Logger(CartEvents.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async emitCheckoutEvent(checkoutEvent: CheckoutEvent) {
    this.logger.log(`Sending checkout event for cart ${checkoutEvent.cartId}`);
    
    try {
      // Send the event object directly, NestJS will handle serialization
      const result = await lastValueFrom(
        this.kafkaClient.emit(KAFKA_TOPICS.CHECKOUT, checkoutEvent)
      );
      
      this.logger.log('Checkout event sent successfully');
      return result;
    } catch (error) {
      this.logger.error(`Failed to send checkout event: ${error.message}`, error.stack);
      throw error;
    }
  }
}