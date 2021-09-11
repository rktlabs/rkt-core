import { TTakeResult } from './types';
import { IMakerService } from './makers/IMakerService';
import { TNewMaker } from '../../models/maker';
export declare class MakerServiceFactory implements IMakerService {
    private makerRepository;
    constructor();
    initializeParams(makerProps: TNewMaker): TNewMaker;
    takeUnits(assetId: string, takeSize: number): Promise<TTakeResult | null>;
}
