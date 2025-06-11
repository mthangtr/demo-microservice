import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@shared/kafka/kafka-topics';
import { CheckoutEvent } from '@shared/types/checkout.interface';
import { OrderService } from './order.service';

@Controller()
export class OrderListener {
  private readonly logger = new Logger(OrderListener.name);

  constructor(private readonly orderService: OrderService) {}

  @EventPattern(KAFKA_TOPICS.CHECKOUT)
  async handleCheckout(@Payload() message: any) {
    try {
      this.logger.log('Raw message received:', JSON.stringify(message));
      
      let checkoutEvent: CheckoutEvent;
      
      // Handle different message formats
      if (typeof message === 'string') {
        checkoutEvent = JSON.parse(message);
      } else if (message.value) {
        // If message has .value property
        if (typeof message.value === 'string') {
          checkoutEvent = JSON.parse(message.value);
        } else {
          checkoutEvent = message.value;
        }
      } else {
        // Direct object
        checkoutEvent = message;
      }
      
      this.logger.log(`Order service received checkout event for cart: ${checkoutEvent.cartId}`);
      
      // Create an order from the checkout event
      const order = await this.orderService.createFromCheckout(checkoutEvent);
      
      this.logger.log(`Order created successfully with ID: ${order._id}`);
      
      return { success: true, orderId: order._id };
    } catch (error) {
      this.logger.error(`Error processing checkout event: ${error.message}`, error.stack);
      throw error;
    }
  }
}