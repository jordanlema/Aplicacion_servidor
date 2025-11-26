import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class WebhookService {
    private readonly gateway;
    constructor(gateway: NotificationsGateway);
    handleNotification(dto: CreateNotificationDto): {
        status: string;
        payload: {
            id: number;
            entity: string;
            operation: string;
            data: any;
            timestamp: string;
        };
    };
}
