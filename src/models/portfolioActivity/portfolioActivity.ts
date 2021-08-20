import { serializeCollection } from './portfolioActivitySerializer'

export class PortfolioActivity {
    // TODO: This is actually a stored object with several properties
    // so expand it here for completeness

    // static serialize(req: any, data: any) {
    //     return serialize(req, data)
    // }

    static serializeCollection(req: any, portfolioId: string, data: any) {
        return serializeCollection(req, portfolioId, data)
    }
}
