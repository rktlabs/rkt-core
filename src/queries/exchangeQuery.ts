'use strict'

import { ExchangeQuoteRepository, ExchangeTradeRepository, ExchangeOrderRepository } from '..'

export class ExchangeQuery {
    exchangeQuoteRepository: ExchangeQuoteRepository
    exchangeTradeRepository: ExchangeTradeRepository
    exchangeOrderRepository: ExchangeOrderRepository

    constructor() {
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()
        this.exchangeOrderRepository = new ExchangeOrderRepository()
    }

    async getExchangeTradesAsync(qs?: any) {
        return {
            data: await this.exchangeTradeRepository.getListAsync(qs),
        }
    }

    async getExchangeTradeDetailAsync(tradeId: string) {
        return {
            data: await this.exchangeTradeRepository.getDetailAsync(tradeId),
        }
    }

    async getExchangeQuotesAsync(qs?: any) {
        return {
            data: await this.exchangeQuoteRepository.getListAsync(qs),
        }
    }

    async getExchangeQuoteAsync(assetId: string) {
        return {
            data: await this.exchangeQuoteRepository.getDetailAsync(assetId),
        }
    }

    async getExchangeOrdersAsync(qs?: any) {
        return {
            data: await this.exchangeOrderRepository.getListAsync(qs),
        }
    }

    async getExchangeOrderDetailAsync(orderId: string) {
        return {
            data: await this.exchangeOrderRepository.getDetailAsync(orderId),
        }
    }
}
