import { RepositoryBase } from '../repositoryBase';
import { TMaker, TMakerUpdate } from '../../models/maker';
export declare class MakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TMaker[]>;
    getDetailAsync(makerId: string): Promise<TMaker | null>;
    storeAsync(entity: TMaker): Promise<void>;
    updateAsync(makerId: string, entityData: TMakerUpdate): Promise<void>;
    deleteAsync(makerId: string): Promise<void>;
}
