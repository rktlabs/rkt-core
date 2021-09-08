import { serializeCollection } from './serialize'

export class PortfolioActivity {
    // static serialize(req: any, data: any) {
    //     return serialize(req, data)
    // }

    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, portfolioId, baseUrl, qs, data)
    }
}
