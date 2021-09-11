'use strict'

import { PortfolioService, MakerServiceFactory } from '.'
import { MakerRepository, PortfolioRepository, DuplicateError, ConflictError, TNewPortfolio, AssetRepository } from '..'
import { TNewMaker, Maker } from '../models/maker'

export class MakerService {
    private assetRepository: AssetRepository
    private makerRepository: MakerRepository
    private portfolioCache: PortfolioRepository
    private portfolioService: PortfolioService
    private makerServiceFactory: MakerServiceFactory

    constructor() {
        this.assetRepository = new AssetRepository()
        this.makerRepository = new MakerRepository()
        this.portfolioCache = new PortfolioRepository()

        this.portfolioService = new PortfolioService()
        this.makerServiceFactory = new MakerServiceFactory()
    }

    async newMaker(payload: TNewMaker, shouldCreatePortfolio: boolean = false) {
        const assetId = payload.assetId
        payload.assetId = assetId

        if (assetId) {
            const maker = await this.makerRepository.getDetailAsync(assetId)
            if (maker) {
                const msg = `Maker Creation Failed - assetId: ${assetId} already exists`
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `maker::${assetId}`
                const portfolio = await this.portfolioCache.getDetailAsync(portfolioId)
                if (portfolio) {
                    const msg = `Maker Creation Failed - portfolioId: ${portfolioId} already exists`
                    throw new ConflictError(msg, { portfolioId })
                }
            }
        }

        // if (payload.initialUnits || payload.initialCoins) {
        //     // check for existence of registry
        //     const treasuryPortfolioId = 'contract::mint'
        //     const treasuryPortfolio = await this.portfolioCache.lookupPortfolio(treasuryPortfolioId)
        //     if (!treasuryPortfolio) {
        //         const msg = `Maker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`
        //         throw new ConflictError(msg, { portfolioId: treasuryPortfolioId })
        //     }
        // }

        const maker = await this.createMakerImpl(payload, shouldCreatePortfolio)

        // if (payload.initialUnits) {
        //     await this.loadAssetUnits(maker, payload.initialUnits)
        // }

        // if (payload.initialCoins) {
        //     await this.loadTreasuryCoins(maker, payload.initialCoins)
        // }

        return maker
    }

    async deleteMaker(assetId: string) {
        // {
        //     // check for linked assets
        //     const entityRefCollection = this.db.collection('assets').where('assetId', '==', assetId)
        //     const entityCollectionRefs = await entityRefCollection.get()
        //     if (entityCollectionRefs.size > 0) {
        //         const assetIds = entityCollectionRefs.docs.map((doc) => {
        //             const data = doc.data()
        //             return data.assetId
        //         })
        //         const assetIdList = assetIds.join(', ')
        //         throw new ConflictError(`Portfolio in use: ${assetIdList}`)
        //     }
        // }
        let asset = await this.assetRepository.getDetailAsync(assetId)
        if (asset) {
            throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetId}`)
        }

        const maker = await this.makerRepository.getDetailAsync(assetId)
        if (maker) {
            const portfolioId = maker.portfolioId

            await this.makerRepository.deleteAsync(assetId)

            if (portfolioId) {
                await this.portfolioService.deletePortfolio(portfolioId)
            }
        }
    }

    async scrubMaker(assetId: string) {
        const portfolioId = `maker::${assetId}`
        await this.portfolioService.scrubPortfolio(portfolioId)
        await this.makerRepository.deleteAsync(assetId)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createMakerImpl(payload: TNewMaker, shouldCreatePortfolio: boolean) {
        // EJH: Init from typed maker as necessary *******

        //const config = this.makerFactory.initializeParams(payload)
        const config = payload

        const newProps = this.makerServiceFactory.initializeParams(payload)

        const maker = Maker.newMaker(newProps)

        if (shouldCreatePortfolio) {
            const portfolioId = await this.createMakerPortfolioImpl(maker)
            maker.portfolioId = portfolioId
        }

        await this.makerRepository.storeAsync(maker)

        return maker
    }

    private async createMakerPortfolioImpl(maker: Maker) {
        const makerPortfolioDef: TNewPortfolio = {
            type: 'maker',
            portfolioId: `maker::${maker.assetId}`,
            ownerId: maker.ownerId,
            displayName: maker.assetId,
            tags: {
                source: 'ASSET_CREATION',
            },
        }

        const portfolio = await this.portfolioService.newPortfolio(makerPortfolioDef)
        return portfolio.portfolioId
    }

    // private async loadAssetUnits(maker: Maker, units: number) {
    //     const assetId = maker.assetId
    //     const portfolioId = maker.portfolioId

    //     // load from different source depending on type: coin or other
    //     const sourcePortfolioId = `asset::${assetId}`

    //     const newTransactionData = {
    //         inputs: [
    //             {
    //                 portfolioId: sourcePortfolioId,
    //                 assetId,
    //                 units: units * -1,
    //             },
    //         ],
    //         outputs: [
    //             {
    //                 portfolioId,
    //                 assetId,
    //                 units,
    //             },
    //         ],
    //         tags: {
    //             source: 'ASSET_CREATION',
    //         },
    //         xids: {
    //             assetId,
    //         },
    //     }

    //     await this.transactionService.newTransactionAsync(newTransactionData)

    // }

    // private async loadTreasuryCoins(maker: Maker, coins: number) {
    //     const assetId = 'coin::fantx'
    //     const sourcePortfolioId = 'contract::mint'
    //     const portfolioId = maker.portfolioId

    //     const newTransactionData = {
    //         inputs: [
    //             {
    //                 portfolioId: sourcePortfolioId,
    //                 assetId,
    //                 units: coins * -1,
    //             },
    //         ],
    //         outputs: [
    //             {
    //                 portfolioId,
    //                 assetId,
    //                 units: coins,
    //             },
    //         ],
    //         tags: {
    //             source: 'ASSET_CREATION',
    //         },
    //         xids: {
    //             assetId,
    //         },
    //     }
    //     await this.transactionService.newTransactionAsync(newTransactionData)

    // }
}
