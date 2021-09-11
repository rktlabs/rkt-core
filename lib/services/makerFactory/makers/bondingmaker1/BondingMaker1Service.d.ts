import { IMakerService } from '../IMakerService';
import { TMakerParams } from './types';
import { TTakeResult } from '../../../..';
import { TNewMaker } from '../../../../models/maker';
export declare class BondingMaker1Service implements IMakerService {
    private makerRepository;
    private parmUpdater;
    private bondingFunction;
    constructor();
    initializeParams(makerProps: TNewMaker): {
        params: TMakerParams;
        type: string;
        ownerId: string;
        assetId: string;
        settings?: any;
    };
    takeUnits(makerId: string, takeSize: number): Promise<TTakeResult | null>;
}
