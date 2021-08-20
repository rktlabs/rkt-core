"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateEarnerSchema(jsonPayload, _earningSchema);
    return validation;
};
exports.validate = validate;
const _earningSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        earnedAt: { type: 'string' },
        units: { type: 'number' },
        event: { type: 'object' },
    },
    required: ['units', 'event'],
};
const _validateEarnerSchema = (jsonPayload, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(jsonPayload, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        throw validationError;
    }
    return validation;
};
