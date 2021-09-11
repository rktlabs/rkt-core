import { TTakeResult } from '../../types';
import { IMakerService } from '../IMakerService';
import { TMakerParams } from './types';
import { TNewMaker } from '../../../../models/maker';
export declare class KMakerService implements IMakerService {
    private makerRepository;
    private parmUpdater;
    constructor();
    initializeParams(makerProps: TNewMaker): {
        params: TMakerParams;
        type: string;
        ownerId: string;
        assetId: string;
        settings?: any;
    };
    takeUnits(makerId: string, takeSize: number): Promise<TTakeResult | null>;
    private computePrice;
}
