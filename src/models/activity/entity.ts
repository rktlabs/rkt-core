'use strict'

import { serializeCollection } from './serialize'

export class Activity {
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }
}
