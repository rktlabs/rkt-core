import { TMaker, TNewMaker } from './types';
export declare class Maker {
    createdAt: string;
    type: string;
    ownerId: string;
    assetId: string;
    portfolioId?: string;
    madeUnits: number;
    currentPrice?: number;
    params?: any;
    constructor(props: TMaker);
    static newMaker(props: TNewMaker): Maker;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
