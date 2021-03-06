'use strict'

// import { ValidationError }  from 'jsonschema'

import { Schema, Validator } from 'jsonschema'

// const _orderSchema = {
//     "$schema": "http://json-schema.org/draft-07/schema#",
//     "type": "object",
//     "properties": {
//         "operation":    { "type": { "enum": [ "order", "cancel" ] } },
//         "type":         { "type": { "enum": [ "limit", "market" ] } },
//         "assetId":      { "type": "string" },
//         "orderId":      { "type": "string" },
//         "portfolioId":  { "type": "string" },
//         "refOrderId":   { "type": "string" },
//         "orderSide":         { "type": { "enum": [ "bid", "ask" ] } },
//         "orderSize":         { "type": "number" },
//         "orderPrice":        { "type": "number" },
//         "tags":         { "type": "object" },
//         // "orderState":        { "type": "string" },
//         // "orderStatus":       { "type": "string" },
//         // "partial":      { "type": { "enum": [ true, false ] } },
//         // "error":        { "type": "string" }
//     },
//     "required": ["portfolioId"]
// }

const _newMarketOrderSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        operation: { type: 'string' },
        orderType: { type: ['market'] },
        assetId: { type: 'string' },
        orderId: { type: 'string' },
        portfolioId: { type: 'string' },
        orderSide: { type: ['bid', 'ask'] }, // only for limit/market order
        orderSize: { type: 'number' },
        tags: { type: 'object' },
    },
    required: ['portfolioId', 'assetId', 'orderSize', 'orderSize'],
}

// const _newLimitOrderSchema = {
//     "$schema": "http://json-schema.org/draft-07/schema#",
//     "type": "object",
//     "properties": {
//         "operation":    { "type": "string" },
//         "type":         { "type": { "enum": [ "limit" ] } },
//         "assetId":      { "type": "string" },
//         "orderId":      { "type": "string" },
//         "portfolioId":  { "type": "string" },
//         "orderSide":         { "type": { "enum": [ "bid", "ask" ] } },  // only for limit/market order
//         "orderSize":         { "type": "number" },
//         "orderPrice":        { "type": "number" }, // only for limit
//     },
//     "required": ["operation", "portfolioId", "type", "assetId", "orderSize", "orderSize", "orderPrice" ]
// }

// const _cancelOrderSchema = {
//     "$schema": "http://json-schema.org/draft-07/schema#",
//     "type": "object",
//     "properties": {
//         "operation":    { "type": "string" },
//         "orderId":      { "type": "string" },
//         "portfolioId":  { "type": "string" },
//         "refOrderId":   { "type": "string" },
//         "tags":         { "type": "object" },
//     },
//     "required": ["type", "assetId", "orderSize", "orderPrice" ]
// }

const _validateOrderSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError
    }
    return validation
}

const _validateNewMarketOrder = (jsonPayload: any) => {
    return _validateOrderSchema(jsonPayload, _newMarketOrderSchema)
}

// const _validateNewLimitOrder = (jsonPayload) => {
//     return(_validateOrderSchema(jsonPayload, _newLimitOrderSchema))
// }

// const _validateCanceldOrder = (jsonPayload) => {
//     return(_validateOrderSchema(jsonPayload, _cancelOrderSchema))
// }

export const validate = (jsonPayload: any) => {
    //    switch (operation) {

    // case "order":
    //     if (jsonPayload.type === 'limit') {
    //         return(_validateNewLimitOrder(jsonPayload))
    //     } else if (jsonPayload.type === 'market') {
    return _validateNewMarketOrder(jsonPayload)
    //     } else {
    //         throw new ValidationError('unknown operation')
    //     }

    // default:
    //     return(_validateOrderSchema(jsonPayload, _orderSchema))
    // }
}
