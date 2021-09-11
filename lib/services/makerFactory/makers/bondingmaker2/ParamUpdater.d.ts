import { TMakerParamsUpdate } from './types';
export declare class ParamUpdater {
    db: FirebaseFirestore.Firestore;
    constructor();
    updateMakerParams(makerId: string, makerPropsUpdate: TMakerParamsUpdate): Promise<void>;
}
