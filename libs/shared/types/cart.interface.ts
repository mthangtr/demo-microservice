export interface CartTypes {
    _id: string;

    userId: string;

    items: { productId: string; quantity: number }[];
}