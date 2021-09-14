'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        leg: {
            type: 'object',
            properties: {
                orderId: { type: 'string' },
                portfolioId: { type: 'string' },
                orderSide: { type: ['bid', 'ask'] },
                orderType: { type: ['limit', 'market'] },
                orderSize: { type: 'number' },
                sizeRemaining: { type: 'number' },
                filledValue: { type: 'number' },
                filledSize: { type: 'number' },
                filledPrice: { type: 'number' },
                isPartial: { type: 'boolean' },
                isClosed: { type: 'boolean' },
                assetId: { type: 'string' },
                tags: { type: 'object' },
            },
            required: [
                'orderId',
                'portfolioId',
                'orderSide',
                'orderType',
                'filledValue',
                'filledSize',
                'sizeRemaining',
            ],
        },
    },
    type: 'object',
    properties: {
        tradeId: { type: 'string' },
        assetId: { type: 'string' },
        executedAt: { type: 'date-time' },
        taker: { $ref: '#/definitions/leg' },
        makers: {
            type: 'array',
            items: { $ref: '#/definitions/leg' },
        },
    },
    required: ['tradeId', 'assetId', 'taker', 'makers'],
};
const validate = (transactionJson) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(transactionJson, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError;
    }
};
exports.validate = validate;
