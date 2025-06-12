import {ProductTypes} from "@shared/types/product.interface";

export interface CheckoutEvent {
  cartId: string;
  userId: string;
  items: Array<{
    product: ProductTypes;
    quantity: number;
  }>;
  totalPrice: number;
  timestamp: Date;
}
