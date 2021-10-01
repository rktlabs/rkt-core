'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { validate } from './validator'

import { validateTransfer } from './transferValidator'
import { TransactionLeg, TTransaction, TTransactionNew } from './types'

export class Transaction {
    transactionId: string
    createdAt: string
    transactionStatus: string
    error?: string

    inputs: TransactionLeg[]
    outputs?: TransactionLeg[]

    tags?: any
    xids?: any

    constructor(props: TTransaction) {
        this.transactionId = props.transactionId
        this.createdAt = props.createdAt
        this.transactionStatus = props.transactionStatus
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
            transactionStatus: 'new',
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
