'use strict'

import { Validator } from 'jsonschema'

export const exchangeOrderValidator = (transactionJson: any) => {
    // const validation = _exchangeOrderValidatorSchema(transactionJson, _exchangeOrderSchema)

    // switch (transactionJson.operation) {
    //     case 'order':
    //         if (transactionJson.orderType === 'limit') {
    //             return _validateNewLimitExchangeOrder(transactionJson)
    //         } else if (transactionJson.orderType === 'market') {
    return _validateNewMarketExchangeOrder(transactionJson)
    //         } else {
    //             throw new ValidationError('unknown operation')
    //         }

    //     case 'cancel':
    //         return _validateCancelExchangeOrder(transactionJson)
    // }
    // return validation
}

// const _exchangeOrderSchema: Schema = {
//     $schema: 'http://json-schema.org/draft-07/schema#',
//     type: 'object',
//     properties: {
//         operation: { type: ['order', 'cancel'] },
//         orderType: { type: ['limit', 'market'] },
//         assetId: { type: 'string' },
//         orderId: { type: 'string' },
//         portfolioId: { type: 'string' },
//         refOrderId: { type: 'string' },
//         orderSide: { type: ['bid', 'ask'] },
//         orderSize: { type: 'number' },
//         orderPrice: { type: 'number' },
//         tags: { type: 'object' },
//         orderState: { type: 'string' },
//         orderStatus: { type: 'string' },
//         error: { type: 'string' },
//     },
//     required: ['operation'],
// }

const _validateNewMarketExchangeOrder = (transactionJson: any) => {
    return _exchangeOrderValidatorSchema(transactionJson, _newMarketOrderSchema)
}

const _exchangeOrderValidatorSchema = (transactionJson: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(transactionJson, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        throw validationError
    }
    return validation
}

const _newMarketOrderSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        operation: { type: ['order'] },
        portfolioId: { type: 'string' },
        orderType: { type: ['market'] },
        assetId: { type: 'string' },
        orderSide: { type: ['bid', 'ask'] }, // only for limit/market order
        orderSize: { type: 'number' },
        tags: { type: 'object' },
    },
    required: ['portfolioId', 'orderType', 'assetId', 'orderSize'],
}

// const _newLimitOrderSchema = {
//     $schema: 'http://json-schema.org/draft-07/schema#',
//     type: 'object',
//     properties: {
//         operation: { type: ['order'] },
//         portfolioId: { type: 'string' },
//         orderType: { type: ['limit'] },
//         assetId: { type: 'string' },
//         orderSide: { type: ['bid', 'ask'] }, // only for limit/market order
//         orderSize: { type: 'number' },
//         orderPrice: { type: 'number' }, // only for limit
//         tags: { type: 'object' },
//     },
//     required: ['operation', 'portfolioId', 'orderType', 'assetId', 'orderSize', 'orderPrice'],
// }

// const _cancelOrderSchema = {
//     $schema: 'http://json-schema.org/draft-07/schema#',
//     type: 'object',
//     properties: {
//         operation: { type: ['cancel'] },
//         portfolioId: { type: 'string' },
//         refOrderId: { type: 'string' },
//         tags: { type: 'object' },
//     },
//     required: ['operation', 'portfolioId', 'refOrderId'],
// }

// const _validateNewLimitExchangeOrder = (transactionJson: any) => {
//     return _exchangeOrderValidatorSchema(transactionJson, _newLimitOrderSchema)
// }

// const _validateCancelExchangeOrder = (transactionJson: any) => {
//     return _exchangeOrderValidatorSchema(transactionJson, _cancelOrderSchema)
// }
