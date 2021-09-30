import { MarketMaker, TNewExchangeOrderConfig } from '../../..';
export interface IMarketMakerService {
    processOrder(order: TNewExchangeOrderConfig): Promise<boolean>;
    on(event: string, listener: (...args: any[]) => void): void;
    marketMaker: MarketMaker;
}
