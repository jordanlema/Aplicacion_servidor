"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = exports.CreateOrderItemDto = void 0;
class CreateOrderItemDto {
    ticketTypeId;
    quantity;
}
exports.CreateOrderItemDto = CreateOrderItemDto;
class CreateOrderDto {
    buyerName;
    buyerEmail;
    paymentMethod;
    items;
}
exports.CreateOrderDto = CreateOrderDto;
//# sourceMappingURL=create-order.dto.js.map