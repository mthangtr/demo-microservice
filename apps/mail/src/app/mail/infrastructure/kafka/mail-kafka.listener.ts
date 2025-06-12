import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from '../../application/services/mail.service';
import { CheckoutEvent } from '../../domain/interfaces/checkout-event.interface';
import { KAFKA_TOPICS } from '@shared/kafka/kafka-topics';

@Controller()
export class MailKafkaListener {
  private readonly logger = new Logger(MailKafkaListener.name);

  constructor(private readonly mailService: MailService) {}

  @EventPattern(KAFKA_TOPICS.CHECKOUT)
  async handleCheckout(@Payload() message: any) {
    try {
      this.logger.log('Raw checkout message received:', JSON.stringify(message));

      let checkoutEvent: CheckoutEvent;

      // Handle different message formats (same as product-service)
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

      this.logger.log(`Mail service received checkout event for cart: ${checkoutEvent.cartId}`);

      // Send order confirmation email
      await this.sendOrderConfirmationEmail(checkoutEvent);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing checkout event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async sendOrderConfirmationEmail(checkoutEvent: CheckoutEvent): Promise<boolean> {
    try {
      // In a real system, you would fetch the user's email from a user service or database
      // For now, we'll use a placeholder email based on userId
      this.logger.log(`Sending order confirmation email to: user-${checkoutEvent.userId}@example.com`);
      const userEmail = `t03612977@gmail.com`;

      return this.mailService.sendTemplateEmail(
        userEmail,
        'order-confirmation', // Template name
        {
          orderId: `order-${Date.now()}`, // In a real system, this would come from the order service
          cartId: checkoutEvent.cartId,
          items: checkoutEvent.items,
          totalPrice: checkoutEvent.totalPrice,
          orderDate: new Date(checkoutEvent.timestamp).toLocaleString(),
          userId: checkoutEvent.userId
        }
      );
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Example of how to handle a Kafka message for sending an email
   */
  // @EventPattern('mail-events')
  async handleSendEmail(data: any) {
    this.logger.log(`Received Kafka message to send email to ${data.to}`);

    try {
      const recipients = Array.isArray(data.to) ? data.to : [data.to];
      const result = await this.mailService.sendEmail({
        to: recipients,
        subject: data.subject,
        text: data.text,
        html: data.html,
        cc: data.cc,
        bcc: data.bcc
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to process Kafka message: ${error.message}`, error.stack);
      throw error;
    }
  }
}
