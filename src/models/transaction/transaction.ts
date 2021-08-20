'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './transactionSerializer'
import { validate } from './transactionValidator'

import { validateTransfer } from './transferValidator'

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

export class Transaction {
    transactionId: string
    createdAt: string
    status: string
    error?: string

    inputs: TransactionLeg[]
    outputs?: TransactionLeg[]

    tags?: any
    xids?: any

    constructor(props: TTransaction) {
        this.transactionId = props.transactionId
        this.createdAt = props.createdAt
        this.status = props.status
        this.inputs = props.inputs
        this.outputs = props.outputs
        this.tags = props.tags
        this.xids = props.xids
    }

    // Member Properties for new model
    static newTransaction(props: TTransactionNew) {
        const transactionId = props.transactionId || `TRX::${generateId()}`
        const createdAt = DateTime.utc().toString()

        const newTransactionProps: TTransaction = {
            transactionId,
            createdAt,
            status: 'new',
            inputs: props.inputs,
            outputs: props.outputs,
        }

        if (props.tags) {
            newTransactionProps.tags = Object.assign({}, props.tags)
        }

        if (props.xids) {
            newTransactionProps.xids = Object.assign({}, props.xids)
        }

        const newEntity = new Transaction(newTransactionProps)
        return newEntity
    }

    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }

    static validateTransfer(jsonPayload: any) {
        try {
            return validateTransfer(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }
}
