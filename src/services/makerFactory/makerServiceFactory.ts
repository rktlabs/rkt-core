'use strict'

import { TTakeResult } from './types'
import { IMakerService } from './makers/IMakerService'
import { KMakerService } from './makers/kmaker'
import { BondingMaker1Service } from './makers/bondingmaker1'
import { BondingMaker2Service } from './makers/bondingmaker2'
import { LogisticMaker1Service } from './makers/logisticmaker1'
import { MakerRepository } from '../..'
import { TNewMaker } from '../../models/maker'

export class MakerServiceFactory implements IMakerService {
    private makerRepository: MakerRepository

    constructor() {
        this.makerRepository = new MakerRepository()
    }

    initializeParams(makerProps: TNewMaker): TNewMaker {
        switch (makerProps.type) {
            case 'constantk':
                const kMakerService = new KMakerService()
                return kMakerService.initializeParams(makerProps)

            case 'bondingmaker1':
                const bmakerService1 = new BondingMaker1Service()
                return bmakerService1.initializeParams(makerProps)

            case 'bondingmaker2':
                const bmakerService2 = new BondingMaker2Service()
                return bmakerService2.initializeParams(makerProps)

            case 'logisticmaker1':
                const logisticmakerService1 = new LogisticMaker1Service()
                return logisticmakerService1.initializeParams(makerProps)

            default:
                const defaultMakerService = new KMakerService()
                return defaultMakerService.initializeParams(makerProps)
        }
    }

    async takeUnits(assetId: string, takeSize: number): Promise<TTakeResult | null> {
        // have to get the maker to get the type. Get if from a "plain" repo
        const maker = await this.makerRepository.getDetailAsync(assetId)
        if (!maker) {
            return null
        }

        switch (maker.type) {
            case 'constantk':
                const kMakerService = new KMakerService()
                return kMakerService.takeUnits(assetId, takeSize)

            case 'bondingmaker1':
                const bmakerService1 = new BondingMaker1Service()
                return bmakerService1.takeUnits(assetId, takeSize)

            case 'bondingmaker2':
                const bmakerService2 = new BondingMaker2Service()
                return bmakerService2.takeUnits(assetId, takeSize)

            case 'logisticmaker1':
                const logisticmakerService1 = new LogisticMaker1Service()
                return logisticmakerService1.takeUnits(assetId, takeSize)

            default:
                const defaultMakerService = new KMakerService()
                return defaultMakerService.takeUnits(assetId, takeSize)
        }
    }
}
