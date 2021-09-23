'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validatePortfolioSchema(jsonPayload, _portfolioSchema);
    return validation;
};
exports.validate = validate;
const _portfolioSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        type: {
            type: ['bank', 'asset', 'user', 'league', 'marketMaker'],
        },
        portfolioId: { type: 'string' },
        displayName: { type: 'string' },
        ownerId: { type: 'string' },
        initialDeposit: { type: 'number' },
    },
    required: ['type', 'name', 'ownerId'],
};
const _validatePortfolioSchema = (jsonPayload, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(jsonPayload, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError;
    }
    return validation;
};
