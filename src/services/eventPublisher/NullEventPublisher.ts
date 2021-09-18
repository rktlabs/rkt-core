'use strict'

import { IEventPublisher } from './IEventPublisher'
import { EventPublisherBase } from './EventPublisherBase'
import { NullPublisher } from '.'

export class NullEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor() {
        const publisher = new NullPublisher()
        super(publisher)
    }
}
