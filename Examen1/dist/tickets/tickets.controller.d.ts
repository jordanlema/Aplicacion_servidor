import { TicketsService } from './tickets.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { CreateTicketTypeDto } from './dtos/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dtos/update-ticket-type.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
export declare class TicketsController {
    private readonly service;
    constructor(service: TicketsService);
    createEvent(dto: CreateEventDto): Promise<import("./entities/event.entity").Event>;
    findAllEvents(): Promise<import("./entities/event.entity").Event[]>;
    findOneEvent(id: number): Promise<import("./entities/event.entity").Event | null>;
    updateEvent(id: number, dto: UpdateEventDto): Promise<import("./entities/event.entity").Event | null>;
    removeEvent(id: number): Promise<import("typeorm").DeleteResult>;
    createTicketType(dto: CreateTicketTypeDto): Promise<import("./entities/ticket-type.entity").TicketType>;
    findAllTicketTypes(): Promise<import("./entities/ticket-type.entity").TicketType[]>;
    findOneTicketType(id: number): Promise<import("./entities/ticket-type.entity").TicketType | null>;
    updateTicketType(id: number, dto: UpdateTicketTypeDto): Promise<import("./entities/ticket-type.entity").TicketType | null>;
    removeTicketType(id: number): Promise<import("typeorm").DeleteResult>;
    createOrder(dto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
    findAllOrders(): Promise<import("./entities/order.entity").Order[]>;
    findOneOrder(id: number): Promise<import("./entities/order.entity").Order | null>;
    updateOrder(id: number, dto: UpdateOrderDto): Promise<import("./entities/order.entity").Order | null>;
    removeOrder(id: number): Promise<import("typeorm").DeleteResult>;
    getEventSummary(id: number): Promise<{
        eventId: number;
        eventName: string;
        totalTickets: number;
        totalAmount: number;
    }>;
}
