import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@shared/kafka/kafka-topics';
import { CheckoutEvent } from '@shared/types/checkout.interface';
import { ProductService } from './product.service';

@Controller()
export class ProductListener {
  private readonly logger = new Logger(ProductListener.name);

  constructor(private readonly productService: ProductService) {}

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
      
      this.logger.log(`Product service received checkout event for cart: ${checkoutEvent.cartId}`);
      
      // Log details of products in checkout
      this.logger.log(`Processing ${checkoutEvent.items.length} product(s) in checkout`);
      
      // In a real-world application, you would update inventory or perform other product-related operations
      const productIds = checkoutEvent.items.map(item => item.product._id); // Sửa từ item.productId thành item.product._id
      const products = await this.productService.getProductsByIds(productIds);
      
      this.logger.log(`Products processed: ${products.products.length}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing checkout event: ${error.message}`, error.stack);
      throw error;
    }
  }
}