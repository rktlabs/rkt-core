'use strict'

export type TPurchase = {
    buyerPorfolioId: string
    sellerPortfolioId: string
    assetId: string
    units: number
    coins: number
    tags?: any
}

export type TTransfer = {
    inputPortfolioId: string
    outputPortfolioId: string
    assetId: string
    units: number
    value: number
    tags?: any
}

export type TransactionLeg = {
    assetId: string
    portfolioId: string
    units: number
    refValue: number
}

export type TTransactionNew = {
    inputs: TransactionLeg[]
    outputs?: TransactionLeg[]
    tags?: any
    xids?: any
}

export type TTransaction = {
    transactionId: string
    createdAt: string
    transactionStatus: string
    error?: string

    inputs: TransactionLeg[]
    outputs?: TransactionLeg[]
    tags?: any
    xids?: any
}

export type TTransactionPatch = {
    transactionStatus: string
    error?: string
}
