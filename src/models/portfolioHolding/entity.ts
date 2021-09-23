'use strict'

import { serialize, serializeCollection } from './serializer'

export class PortfolioHolding {
    static serialize(selfUrl: string, portfolioId: string, baseUrl: string, data: any) {
        return serialize(selfUrl, portfolioId, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, portfolioId, baseUrl, qs, data)
    }
}
