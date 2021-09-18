import { AssetHolderRepository } from '../repositories/asset/assetHolderRepository';
import { AssetRepository } from '../repositories/asset/assetRepository';
export declare class AssetQuery {
    assetRepository: AssetRepository;
    assetHolderRepository: AssetHolderRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TAsset[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TAsset | null>;
    getAssetHoldersAsync(qs?: any): Promise<{
        data: import("..").TAssetHolder[];
    }>;
}
