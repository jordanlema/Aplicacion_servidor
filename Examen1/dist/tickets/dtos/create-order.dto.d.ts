export declare class CreateOrderItemDto {
    ticketTypeId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    buyerName: string;
    buyerEmail: string;
    paymentMethod: string;
    items: CreateOrderItemDto[];
}
