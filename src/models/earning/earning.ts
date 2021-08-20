import { serializeCollection } from './earningSerializer'
import { ValidationError, TypeError, NameError } from '../../errors'
import { validate } from './earningValidator'
import * as cryptojs from 'crypto-js'

export type TEarning = {
    earnedAt?: string
    units: number
    event: any
}

export class Earning {
    static serializeCollection(req: any, earnerId: string, data: any) {
        return serializeCollection(req, earnerId, data)
    }

    static sig(earning: TEarning) {
        const eventString = JSON.stringify(earning.event)
        const payload = `${earning.earnedAt}|${earning.units}|${eventString}`
            .toLowerCase() // force lower case
            .replace(/\s/g, '') // strip out all whitespace

        const sig = cryptojs.SHA256(payload).toString()
        return sig
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.earnerId && jsonPayload.type) {
            const parts = jsonPayload.earnerId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Earner Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Earner Id')
            }
        }

        try {
            validate(jsonPayload)
            return jsonPayload as TEarning
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }
}
