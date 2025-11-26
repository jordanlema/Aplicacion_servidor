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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const tickets_service_1 = require("./tickets.service");
const create_event_dto_1 = require("./dtos/create-event.dto");
const update_event_dto_1 = require("./dtos/update-event.dto");
const create_ticket_type_dto_1 = require("./dtos/create-ticket-type.dto");
const update_ticket_type_dto_1 = require("./dtos/update-ticket-type.dto");
const create_order_dto_1 = require("./dtos/create-order.dto");
const update_order_dto_1 = require("./dtos/update-order.dto");
let TicketsController = class TicketsController {
    service;
    constructor(service) {
        this.service = service;
    }
    createEvent(dto) {
        return this.service.createEvent(dto);
    }
    findAllEvents() {
        return this.service.findAllEvents();
    }
    findOneEvent(id) {
        return this.service.findOneEvent(id);
    }
    updateEvent(id, dto) {
        return this.service.updateEvent(id, dto);
    }
    removeEvent(id) {
        return this.service.removeEvent(id);
    }
    createTicketType(dto) {
        return this.service.createTicketType(dto);
    }
    findAllTicketTypes() {
        return this.service.findAllTicketTypes();
    }
    findOneTicketType(id) {
        return this.service.findOneTicketType(id);
    }
    updateTicketType(id, dto) {
        return this.service.updateTicketType(id, dto);
    }
    removeTicketType(id) {
        return this.service.removeTicketType(id);
    }
    createOrder(dto) {
        return this.service.createOrder(dto);
    }
    findAllOrders() {
        return this.service.findAllOrders();
    }
    findOneOrder(id) {
        return this.service.findOneOrder(id);
    }
    updateOrder(id, dto) {
        return this.service.updateOrder(id, dto);
    }
    removeOrder(id) {
        return this.service.removeOrder(id);
    }
    getEventSummary(id) {
        return this.service.getEventSummary(id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findAllEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findOneEvent", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "removeEvent", null);
__decorate([
    (0, common_1.Post)('ticket-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_type_dto_1.CreateTicketTypeDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "createTicketType", null);
__decorate([
    (0, common_1.Get)('ticket-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findAllTicketTypes", null);
__decorate([
    (0, common_1.Get)('ticket-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findOneTicketType", null);
__decorate([
    (0, common_1.Put)('ticket-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_ticket_type_dto_1.UpdateTicketTypeDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "updateTicketType", null);
__decorate([
    (0, common_1.Delete)('ticket-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "removeTicketType", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findOneOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "removeOrder", null);
__decorate([
    (0, common_1.Get)('events/:id/summary'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "getEventSummary", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map