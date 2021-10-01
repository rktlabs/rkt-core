import { ActivityRepository } from '..';
import { AssetHolderRepository } from '../repositories/asset/assetHolderRepository';
import { AssetRepository } from '../repositories/asset/assetRepository';
export declare class AssetQuery {
    assetRepository: AssetRepository;
    activityRepository: ActivityRepository;
    assetHolderRepository: AssetHolderRepository;
    constructor(assetRepository: AssetRepository);
    getListAsync(qs?: any): Promise<{
        data: import("..").TAsset[];
    }>;
    getDetailAsync(id: string): Promise<any>;
    getAssetHoldersAsync(qs?: any): Promise<{
        data: import("..").TAssetHolder[];
    }>;
    getAssetctivityAsync(assetId: string, qs?: any): Promise<{
        data: import("..").TTransaction[];
    }>;
}
