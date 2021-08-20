import { serialize, serializeCollection } from './portfolioAssetSerializer'

export class PortfolioAsset {
    // TODO: This is actually a stored object sith assetId and unitCount
    // so expand it here for completeness

    static serialize(req: any, portfolioId: string, data: any) {
        return serialize(req, portfolioId, data)
    }

    static serializeCollection(req: any, portfolioId: string, data: any) {
        return serializeCollection(req, portfolioId, data)
    }
}
