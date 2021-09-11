import { AssetHoldersRepository } from '../repositories/asset/assetHoldersRepository';
import { AssetRepository } from '../repositories/asset/assetRepository';
export declare class AssetQuery {
    assetRepository: AssetRepository;
    assetHoldersRepository: AssetHoldersRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TAsset[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TAsset | null>;
    getAssetHoldersAsync(qs?: any): Promise<{
        data: import("..").TAssetHolder[];
    }>;
}
