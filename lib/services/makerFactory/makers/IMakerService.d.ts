import { TTakeResult } from '../types';
import { TNewMaker } from '../../../models/maker';
export interface IMakerService {
    initializeParams(makerProps: TNewMaker): TNewMaker;
    takeUnits(makerId: string, takeSize: number): Promise<TTakeResult | null>;
}
