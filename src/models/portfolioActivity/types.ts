'use strict'

export type TPortfolioActivity = {
    createdAt: string
    assetId: string
    units: number
    transactionId: string
    orderId?: string
    orderPortfolioId?: string
}
