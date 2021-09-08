import { AssetHoldersRepository } from '../repositories/AssetHoldersRepository';
import { AssetRepository } from '../repositories/assetRepository';
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
