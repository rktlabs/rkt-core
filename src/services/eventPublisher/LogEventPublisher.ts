'use strict'

import { Logger } from 'log4js'
import { IEventPublisher } from './IEventPublisher'
import { EventPublisherBase } from './EventPublisherBase'
import { LoggingPublisher } from '.'

export class LogEventPublisher extends EventPublisherBase implements IEventPublisher {
    constructor(opts: { logger: Logger }) {
        const publisher = new LoggingPublisher(opts)
        super(publisher)
    }
}
