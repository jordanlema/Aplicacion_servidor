import { TicketType } from './ticket-type.entity';
export declare class Event {
    id: number;
    name: string;
    description: string;
    date: Date;
    location: string;
    basePrice: number;
    ticketTypes: TicketType[];
}
