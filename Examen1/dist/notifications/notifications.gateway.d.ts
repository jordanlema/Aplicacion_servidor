import { Server } from 'socket.io';
export declare class NotificationsGateway {
    server: Server;
    emitNotification(payload: any): void;
}
