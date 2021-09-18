import { IEventPublisher } from './IEventPublisher';
import { EventPublisherBase } from './EventPublisherBase';
export declare class NullEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor();
}
