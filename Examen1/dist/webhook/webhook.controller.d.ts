import { WebhookService } from './webhook.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class WebhookController {
    private readonly service;
    constructor(service: WebhookService);
    notify(dto: CreateNotificationDto): {
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
