import { Order } from './order.entity';
import { TicketType } from './ticket-type.entity';
export declare class OrderItem {
    id: number;
    quantity: number;
    unitPrice: number;
    order: Order;
    ticketType: TicketType;
}
