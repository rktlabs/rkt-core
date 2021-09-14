import { DateTime } from 'luxon'
import { generateId } from '../..'
import { ValidationError, TypeError, NameError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { TUser, TNewUserConfig } from './types'
import { validate } from './validator'

// User holds value (coin) and shares to be sold.
export class User {
    createdAt: string
    userId: string
    id: string // TEMP till consolidate on userId as Id

    dob: string
    email: string
    name: string
    username: string
    displayName?: string
    tags?: any

    portfolioId?: string
    isNew?: boolean
    referrerId?: string

    constructor(props: TUser) {
        this.createdAt = props.createdAt
        this.dob = props.dob
        this.email = props.email
        this.userId = props.userId
        this.id = props.id
        this.name = props.name
        this.username = props.username
        this.displayName = props.displayName
        this.portfolioId = props.portfolioId
        this.tags = props.tags

        this.isNew = props.isNew
        this.referrerId = props.referrerId
    }

    toString() {
        return `[user: ${this.userId}]`
    }

    // Member Properties for new model
    static newUser(props: TNewUserConfig) {
        let userId: string
        if (props.userId) {
            userId = props.userId
        } else {
            userId = `${generateId()}`
        }

        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || props.name || props.username

        const userProps: TUser = {
            userId,
            id: userId, // TEMP till consolidate on userId as Id
            createdAt,
            displayName,
            dob: props.dob,
            email: props.email,
            name: props.name,
            username: props.username,
            referrerId: props.referrerId,
            isNew: true,
        }

        if (props.tags) {
            userProps.tags = Object.assign({}, props.tags)
        }

        const newEntity = new User(userProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.userId && jsonPayload.type) {
            const parts = jsonPayload.userId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid User Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid User Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }
}
