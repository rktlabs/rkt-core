import { NameError, ValidationError } from '../../errors'
import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { serialize, serializeCollection } from './contractSerializer'
import { validate } from './contractValidator'

export type TContractEarnerDef = {
    earnerId: string
    initialPrice: number
    displayName: string
}

export type TNewContract = {
    contractId: string
    ownerId: string
    displayName?: string
    description?: string
    startAt?: string
    endAt?: string
    acceptEarningsAfter?: string
    ignoreEarningsAfter?: string
    key?: string
    pt?: number
    tags?: any
    earnerList?: TContractEarnerDef[]
}

export type TContract = {
    createdAt: string
    contractId: string
    ownerId: string
    portfolioId: string
    displayName: string
    description: string
    startAt?: string
    endAt?: string
    acceptEarningsAfter?: string
    ignoreEarningsAfter?: string
    key?: string
    pt?: number
    tags?: any
    //playerList?: TContractAssetDef[]
    managedAssets: string[]
    currencyId: string
    currencySource: string
}

export type TContractUpdate = {
    managedAssets: string[]
}

// Contract holds value (coin) and shares to be sold.
export class Contract {
    createdAt: string
    contractId: string
    ownerId: string
    portfolioId: string
    displayName: string
    description: string
    startAt?: string
    endAt?: string
    acceptEarningsAfter?: string
    ignoreEarningsAfter?: string
    key?: string
    pt?: number
    tags?: any
    // playerList?: TContractAssetDef[]
    managedAssets: string[]
    currencyId: string
    currencySource: string

    constructor(props: TContract) {
        this.createdAt = props.createdAt
        this.contractId = props.contractId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.displayName = props.displayName || props.contractId
        this.description = props.description || this.displayName
        this.startAt = props.startAt
        this.endAt = props.endAt
        this.acceptEarningsAfter = props.acceptEarningsAfter
        this.ignoreEarningsAfter = props.ignoreEarningsAfter
        this.key = props.key
        this.pt = props.pt
        this.tags = props.tags
        // this.playerList = props.playerList
        this.managedAssets = props.managedAssets
        this.currencyId = props.currencyId
        this.currencySource = props.currencySource
    }

    // Member Properties for new model
    static newContract(props: TNewContract) {
        const contractId = props.contractId || `${generateId()}`
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || contractId
        const description = props.displayName || displayName
        const portfolioId = `contract::${contractId}`

        const contractProps: TContract = {
            contractId,
            createdAt,
            displayName,
            description,
            ownerId: props.ownerId,
            portfolioId: portfolioId,
            startAt: props.startAt || createdAt,
            endAt: props.endAt,
            acceptEarningsAfter: props.acceptEarningsAfter || props.startAt || createdAt,
            ignoreEarningsAfter: props.ignoreEarningsAfter || props.endAt,
            key: props.key,
            pt: props.pt,
            //playerList: props.earnerList,
            managedAssets: [],
            currencyId: 'coin::fantx',
            currencySource: 'contract::mint',
        }

        if (props.tags) {
            contractProps.tags = Object.assign({}, props.tags)
        }

        const newEntity = new Contract(contractProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.contractId && jsonPayload.type) {
            const parts = jsonPayload.contractId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Contract Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Contract Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }

    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
    }
}
