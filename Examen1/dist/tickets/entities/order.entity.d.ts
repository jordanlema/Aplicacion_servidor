import { OrderItem } from './order-item.entity';
export declare class Order {
    id: number;
    buyerName: string;
    buyerEmail: string;
    total: number;
    paymentMethod: string;
    items: OrderItem[];
}
