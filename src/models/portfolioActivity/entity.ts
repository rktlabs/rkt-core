import { serializeCollection } from './serialize'

export class PortfolioActivity {
    // TODO: This is actually a stored object with several properties
    // so expand it here for completeness

    // static serialize(req: any, data: any) {
    //     return serialize(req, data)
    // }

    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, portfolioId, baseUrl, qs, data)
    }
}
