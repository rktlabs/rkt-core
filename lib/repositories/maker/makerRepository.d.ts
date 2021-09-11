import { TMaker, TMakerPatch } from '../../models/maker';
import { RepositoryBase } from '../repositoryBase';
export declare class MakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TMaker[]>;
    getDetailAsync(makerId: string): Promise<TMaker | null>;
    storeAsync(entity: TMaker): Promise<void>;
    updateAsync(makerId: string, entityData: TMakerPatch): Promise<void>;
    deleteAsync(makerId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
}
