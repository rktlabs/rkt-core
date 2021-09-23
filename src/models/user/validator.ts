'use strict'

import { Validator } from 'jsonschema'

export const validate = (jsonPayload: any) => {
    const validation = _validateUserSchema(jsonPayload, _userSchema)
    return validation
}

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
}

const _validateUserSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        if (validationError) {
        }
        throw validationError
    }
    return validation
}
