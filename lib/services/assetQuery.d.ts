import { AssetRepository } from '../repositories/assetRepository';
export declare class AssetQuery {
    assetRepository: AssetRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TAsset[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TAsset | null>;
}
