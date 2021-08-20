'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransfer = void 0;
const jsonschema_1 = require("jsonschema");
const transferSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        assetId: { type: 'string' },
        units: { type: 'number' },
        inputPortfolioId: { type: 'string' },
        outputPortfolioId: { type: 'string' },
    },
    required: ['assetId', 'units', 'inputPortfolioId', 'outputPortfolioId'],
};
const validateTransfer = (transactionJson) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(transactionJson, transferSchema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError;
    }
};
exports.validateTransfer = validateTransfer;
