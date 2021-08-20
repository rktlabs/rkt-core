import { Validator } from 'jsonschema'

export const validate = (jsonPayload: any) => {
    const validation = _validateEarnerSchema(jsonPayload, _earningSchema)
    return validation
}

const _earningSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',

    type: 'object',
    properties: {
        earnedAt: { type: 'string' },
        units: { type: 'number' },
        event: { type: 'object' },
    },
    required: ['units', 'event'],
}

const _validateEarnerSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        throw validationError
    }
    return validation
}
