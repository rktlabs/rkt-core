import { MarketMaker, TExchangeOrder } from '../../..';
export interface IMarketMakerService {
    processOrder(order: TExchangeOrder): Promise<boolean>;
    on(event: string, listener: (...args: any[]) => void): void;
    marketMaker: MarketMaker;
}
