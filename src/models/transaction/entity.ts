'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'

import { validateTransfer } from './transferValidator'
import { TransactionLeg, TTransaction, TTransactionNew } from './types'

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
        const transactionId = `TRX::${generateId()}`
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

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }

    static validateTransfer(jsonPayload: any) {
        try {
            return validateTransfer(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }
}
