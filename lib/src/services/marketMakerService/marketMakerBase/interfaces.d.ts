import { Trade, TOrder, TMakerResult } from '../..';
export interface IMarketMaker {
    processOrder(order: TOrder): Promise<Trade | null>;
    processOrderImpl(orderSide: string, orderSize: number): Promise<TMakerResult | null>;
    flattenMaker(): void;
}
