'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { MakerService, MakerRepository, PortfolioRepository } from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'
import { TNewMakerConfig } from '../../src/services/makerService/makers/makerBase/types'

describe('Maker Service', function () {
    this.timeout(5000)

    let makerService: MakerService
    let makerRepository: MakerRepository
    let portfolioRepository: PortfolioRepository
    let bootstrapper: BootstrapService
    let assetId: string = 'card::test1'

    before(async () => {
        makerService = new MakerService()
        makerRepository = new MakerRepository()
        portfolioRepository = new PortfolioRepository()

        bootstrapper = new BootstrapService()

        //await bootstrapper.clearDb()
        await bootstrapper.bootstrap()
    })

    beforeEach(async () => {
        await makerService.scrubMaker(assetId)
    })

    after(async () => {})

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMakerConfig = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.createMaker(data)

            const readBack = await makerRepository.getDetailAsync(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMakerConfig = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.createMaker(data, true)

            const readBack = await makerRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

            const portfolio = await portfolioRepository.getDetailAsync(`maker::${assetId}`)
            expect(portfolio).to.exist
        })
    })
})
