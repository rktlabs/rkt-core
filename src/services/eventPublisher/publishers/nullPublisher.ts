'use strict'

import { IPublisher } from './iPublisher'

export class NullPublisher implements IPublisher {
    constructor() {}

    async publishMessage(topicName: string, payload: any) {}
}
