"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateMakerSchema(jsonPayload, _makerSchema);
    return validation;
};
exports.validate = validate;
const _makerSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        type: { type: { enum: ['coin', 'card', 'pack'] } },
        makerId: { type: 'string' },
        symbol: { type: 'string' },
        displayName: { type: 'string' },
        contractId: { type: 'string' },
        contractDisplayName: { type: 'string' },
        earnerId: { type: 'string' },
        earnerDisplayName: { type: 'string' },
    },
    required: ['ownerId', 'symbol', 'type', 'contractId', 'earnerId', 'displayName'],
};
const _validateMakerSchema = (jsonPayload, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(jsonPayload, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        if (validationError) {
        }
        throw validationError;
    }
    return validation;
};
