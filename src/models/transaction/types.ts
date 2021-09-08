'use strict'

export type TPurchase = {
    buyerPorfolioId: string
    sellerPortfolioId: string
    assetId: string
    units: number
    coins: number
}

export type TTransfer = {
    inputPortfolioId: string
    outputPortfolioId: string
    assetId: string
    units: number
    tags?: any
}

export type TNewTransactionLeg = {
    assetId: string
    portfolioId: string
    units: number
}

export type TTransactionNew = {
    transactionId?: string
    inputs: TNewTransactionLeg[]
    outputs?: TNewTransactionLeg[]
    tags?: any
    xids?: any
}

export type TransactionLeg = {
    assetId: string
    portfolioId: string
    units: number
    cost?: number
    _deltaCost?: number
    _deltaNet?: number
    _unitCost?: number
}

export type TTransaction = {
    transactionId: string
    createdAt: string
    status: string
    error?: string

    inputs: TransactionLeg[]
    outputs?: TransactionLeg[]

    tags?: any
    xids?: any
}

export type TTransactionPatch = {
    status: string
    error?: string
}
