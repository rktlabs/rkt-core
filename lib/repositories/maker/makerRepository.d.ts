import { MakerBase } from '../../services/makerService/makers/makerBase/entity';
import { TMaker, TMakerPatch } from '../../services/makerService/makers/makerBase/types';
import { RepositoryBase } from '../repositoryBase';
export declare class MakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TMaker[]>;
    getDetailAsync(makerId: string): Promise<TMaker | null>;
    storeAsync(entity: MakerBase): Promise<void>;
    updateAsync(makerId: string, entityData: TMakerPatch): Promise<void>;
    updateMakerStateAsync(makerId: string, stateUpdate: any): Promise<void>;
    deleteAsync(makerId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
}
