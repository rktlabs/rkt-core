'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeOrderValidator = void 0;
const jsonschema_1 = require("jsonschema");
const exchangeOrderValidator = (transactionJson) => {
    // const validation = _exchangeOrderValidatorSchema(transactionJson, _exchangeOrderSchema)
    // switch (transactionJson.operation) {
    //     case 'order':
    //         if (transactionJson.orderType === 'limit') {
    //             return _validateNewLimitExchangeOrder(transactionJson)
    //         } else if (transactionJson.orderType === 'market') {
    return _validateNewMarketExchangeOrder(transactionJson);
    //         } else {
    //             throw new ValidationError('unknown operation')
    //         }
    //     case 'cancel':
    //         return _validateCancelExchangeOrder(transactionJson)
    // }
    // return validation
};
exports.exchangeOrderValidator = exchangeOrderValidator;
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
//         state: { type: 'string' },
//         status: { type: 'string' },
//         error: { type: 'string' },
//     },
//     required: ['operation'],
// }
const _validateNewMarketExchangeOrder = (transactionJson) => {
    return _exchangeOrderValidatorSchema(transactionJson, _newMarketOrderSchema);
};
const _exchangeOrderValidatorSchema = (transactionJson, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(transactionJson, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        throw validationError;
    }
    return validation;
};
const _newMarketOrderSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        operation: { type: ['order'] },
        portfolioId: { type: 'string' },
        orderType: { type: ['market'] },
        assetId: { type: 'string' },
        orderSide: { type: ['bid', 'ask'] },
        orderSize: { type: 'number' },
        tags: { type: 'object' },
    },
    required: ['portfolioId', 'orderType', 'assetId', 'orderSize'],
};
