"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateEarnerSchema(jsonPayload, _earnerSchema);
    return validation;
};
exports.validate = validate;
const _earnerSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        type: { type: { enum: ['coin', 'card', 'pack'] } },
        name: { type: 'string' },
        displayName: { type: 'string' },
        symbool: { type: 'string' },
        subject: { type: 'object' },
        scale: { type: 'number' },
    },
    required: ['ownerId', 'type', 'name', 'symbool', 'displayName'],
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
