import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { CreateTicketTypeDto } from './dtos/create-ticket-type.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
export declare class TicketsService {
    private eventsRepo;
    private ticketTypesRepo;
    private ordersRepo;
    private orderItemsRepo;
    private readonly httpService;
    constructor(eventsRepo: Repository<Event>, ticketTypesRepo: Repository<TicketType>, ordersRepo: Repository<Order>, orderItemsRepo: Repository<OrderItem>, httpService: HttpService);
    createEvent(dto: CreateEventDto): Promise<Event>;
    findAllEvents(): Promise<Event[]>;
    findOneEvent(id: number): Promise<Event | null>;
    updateEvent(id: number, dto: any): Promise<Event | null>;
    removeEvent(id: number): Promise<import("typeorm").DeleteResult>;
    createTicketType(dto: CreateTicketTypeDto): Promise<TicketType>;
    findAllTicketTypes(): Promise<TicketType[]>;
    findOneTicketType(id: number): Promise<TicketType | null>;
    updateTicketType(id: number, dto: any): Promise<TicketType | null>;
    removeTicketType(id: number): Promise<import("typeorm").DeleteResult>;
    createOrder(dto: CreateOrderDto): Promise<Order>;
    findAllOrders(): Promise<Order[]>;
    findOneOrder(id: number): Promise<Order | null>;
    updateOrder(id: number, dto: any): Promise<Order | null>;
    removeOrder(id: number): Promise<import("typeorm").DeleteResult>;
    getEventSummary(eventId: number): Promise<{
        eventId: number;
        eventName: string;
        totalTickets: number;
        totalAmount: number;
    }>;
}
