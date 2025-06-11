export interface CheckoutEvent {
  cartId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  totalPrice: number;
  timestamp: Date;
}
