import { Trade, TOrder, TMakerResult, TMarketMaker } from '../..';
export interface IMarketMaker extends TMarketMaker {
    processOrder(order: TOrder): Promise<Trade | null>;
    processOrderImpl(orderSide: string, orderSize: number): Promise<TMakerResult | null>;
    flattenMaker(): void;
}
