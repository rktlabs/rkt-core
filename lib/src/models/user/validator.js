'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateUserSchema(jsonPayload, _userSchema);
    return validation;
};
exports.validate = validate;
const _userSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        userId: { type: 'string' },
        dob: { type: 'string' },
        displayName: { type: 'string' },
        name: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        initialUnits: { type: 'number' },
        referrerId: { type: 'string' },
        isNew: { type: 'boolean' },
    },
    required: ['dob', 'email', 'name', 'username'],
};
const _validateUserSchema = (jsonPayload, schema) => {
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
