import { ExchangeQuoteRepository, ExchangeTradeRepository, ExchangeOrderRepository } from '..';
export declare class ExchangeQuery {
    exchangeQuoteRepository: ExchangeQuoteRepository;
    exchangeTradeRepository: ExchangeTradeRepository;
    exchangeOrderRepository: ExchangeOrderRepository;
    constructor();
    getExchangeTradesAsync(qs?: any): Promise<{
        data: import("..").TExchangeTrade[];
    }>;
    getExchangeTradeDetailAsync(tradeId: string): Promise<{
        data: import("..").TExchangeTrade | null;
    }>;
    getExchangeQuotesAsync(qs?: any): Promise<{
        data: import("..").TExchangeQuote[];
    }>;
    getExchangeQuoteAsync(assetId: string): Promise<{
        data: import("..").TExchangeQuote | null;
    }>;
    getExchangeOrdersAsync(qs?: any): Promise<{
        data: import("..").TExchangeOrder[];
    }>;
    getExchangeOrderDetailAsync(orderId: string): Promise<{
        data: import("..").TExchangeOrder | null;
    }>;
}
