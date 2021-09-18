'use strict'

import { IEventPublisher } from './IEventPublisher'
import { EventPublisherBase } from './EventPublisherBase'
import { ConsolePublisher } from '.'

export class ConsoleEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor() {
        const publisher = new ConsolePublisher()
        super(publisher)
    }
}
