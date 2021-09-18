'use strict'

import { QueuePublisher } from './publishers/queuePublisher'
import { IEventPublisher } from './IEventPublisher'
import { EventPublisherBase } from './EventPublisherBase'

export class QueueEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor() {
        const publisher = new QueuePublisher()
        super(publisher)
    }
}
