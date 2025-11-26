"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const ticket_type_entity_1 = require("./entities/ticket-type.entity");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
let TicketsService = class TicketsService {
    eventsRepo;
    ticketTypesRepo;
    ordersRepo;
    orderItemsRepo;
    httpService;
    constructor(eventsRepo, ticketTypesRepo, ordersRepo, orderItemsRepo, httpService) {
        this.eventsRepo = eventsRepo;
        this.ticketTypesRepo = ticketTypesRepo;
        this.ordersRepo = ordersRepo;
        this.orderItemsRepo = orderItemsRepo;
        this.httpService = httpService;
    }
    async createEvent(dto) {
        const event = this.eventsRepo.create(dto);
        const saved = await this.eventsRepo.save(event);
        await this.httpService.post('http://localhost:3000/webhook/notificaciones', {
            id: saved.id,
            entity: 'event',
            operation: 'create',
            data: saved,
        }).toPromise().catch(() => { });
        return saved;
    }
    findAllEvents() {
        return this.eventsRepo.find({ relations: ['ticketTypes'] });
    }
    findOneEvent(id) {
        return this.eventsRepo.findOne({ where: { id }, relations: ['ticketTypes'] });
    }
    async updateEvent(id, dto) {
        await this.eventsRepo.update(id, dto);
        const updated = await this.findOneEvent(id);
        if (updated) {
            await this.httpService.post('http://localhost:3000/webhook/notificaciones', {
                id: updated.id,
                entity: 'event',
                operation: 'update',
                data: updated,
            }).toPromise().catch(() => { });
        }
        return updated;
    }
    removeEvent(id) {
        return this.eventsRepo.delete(id);
    }
    async createTicketType(dto) {
        const event = await this.eventsRepo.findOneBy({ id: dto.eventId });
        if (!event)
            throw new Error(`Event with id ${dto.eventId} not found`);
        const tt = this.ticketTypesRepo.create({
            name: dto.name,
            price: dto.price,
            event,
        });
        return this.ticketTypesRepo.save(tt);
    }
    findAllTicketTypes() {
        return this.ticketTypesRepo.find({ relations: ['event'] });
    }
    findOneTicketType(id) {
        return this.ticketTypesRepo.findOne({ where: { id }, relations: ['event'] });
    }
    async updateTicketType(id, dto) {
        if (dto.eventId) {
            const event = await this.eventsRepo.findOneBy({ id: dto.eventId });
            await this.ticketTypesRepo.update(id, { ...dto, event });
        }
        else {
            await this.ticketTypesRepo.update(id, dto);
        }
        return this.findOneTicketType(id);
    }
    removeTicketType(id) {
        return this.ticketTypesRepo.delete(id);
    }
    async createOrder(dto) {
        const order = this.ordersRepo.create({
            buyerName: dto.buyerName,
            buyerEmail: dto.buyerEmail,
            paymentMethod: dto.paymentMethod,
            total: 0,
            items: [],
        });
        let total = 0;
        for (const itemDto of dto.items) {
            const tt = await this.ticketTypesRepo.findOneBy({ id: itemDto.ticketTypeId });
            if (!tt)
                throw new Error(`TicketType with id ${itemDto.ticketTypeId} not found`);
            const item = this.orderItemsRepo.create({
                ticketType: tt,
                quantity: itemDto.quantity,
                unitPrice: tt.price,
            });
            total += Number(tt.price) * itemDto.quantity;
            order.items.push(item);
        }
        order.total = total;
        const saved = await this.ordersRepo.save(order);
        await this.httpService.post('http://localhost:3000/webhook/notificaciones', {
            id: saved.id,
            entity: 'order',
            operation: 'create',
            data: saved,
        }).toPromise().catch(() => { });
        return saved;
    }
    findAllOrders() {
        return this.ordersRepo.find({ relations: ['items', 'items.ticketType'] });
    }
    findOneOrder(id) {
        return this.ordersRepo.findOne({ where: { id }, relations: ['items', 'items.ticketType'] });
    }
    async updateOrder(id, dto) {
        const { buyerName, buyerEmail, paymentMethod } = dto;
        await this.ordersRepo.update(id, { buyerName, buyerEmail, paymentMethod });
        const updated = await this.findOneOrder(id);
        if (updated) {
            await this.httpService.post('http://localhost:3000/webhook/notificaciones', {
                id: updated.id,
                entity: 'order',
                operation: 'update',
                data: updated,
            }).toPromise().catch(() => { });
        }
        return updated;
    }
    removeOrder(id) {
        return this.ordersRepo.delete(id);
    }
    async getEventSummary(eventId) {
        const event = await this.eventsRepo.findOne({ where: { id: eventId }, relations: ['ticketTypes'] });
        if (!event)
            throw new Error('Event not found');
        const items = await this.orderItemsRepo.find({ relations: ['ticketType', 'ticketType.event'] });
        let totalTickets = 0;
        let totalAmount = 0;
        for (const item of items) {
            if (item.ticketType.event.id === eventId) {
                totalTickets += item.quantity;
                totalAmount += Number(item.unitPrice) * item.quantity;
            }
        }
        return {
            eventId: event.id,
            eventName: event.name,
            totalTickets,
            totalAmount,
        };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_type_entity_1.TicketType)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(3, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map