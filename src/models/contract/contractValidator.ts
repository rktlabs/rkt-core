import { Validator } from 'jsonschema'

export const validate = (jsonPayload: any) => {
    const validation = _validateContractSchema(jsonPayload, _contractSchema)
    return validation
}

const _contractSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',

    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        displayName: { type: 'string' },
        startAt: { type: 'string' },
        endAt: { type: 'string' },
        key: { type: 'string' },
        pt: { type: 'number' },
    },
    required: ['displayName', 'startAt', 'endAt', 'key', 'pt'],
}

const _validateContractSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        if (validationError) {
            // delete validationError.schema
            // delete validationError.instance
        }
        throw validationError
    }
    return validation
}
