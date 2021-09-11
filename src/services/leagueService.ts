'use strict'

import { PortfolioService, MakerService } from '.'
import {
    AssetRepository,
    LeagueRepository,
    PortfolioRepository,
    TNewLeague,
    DuplicateError,
    ConflictError,
    League,
    TLeagueAssetDef,
    TNewAsset,
    TAsset,
} from '..'
import { TNewMaker } from '../models/maker'
import { AssetService } from './assetService'

export class LeagueService {
    private assetRepository: AssetRepository
    private leagueRepository: LeagueRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioService
    private assetService: AssetService
    private makerService: MakerService

    constructor() {
        this.assetRepository = new AssetRepository()
        this.leagueRepository = new LeagueRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.portfolioService = new PortfolioService()
        this.assetService = new AssetService()
        this.makerService = new MakerService()
    }

    async newLeague(payload: TNewLeague) {
        const leagueId = payload.leagueId

        if (leagueId) {
            // check for existing league with that Id. If exists, then fail out.
            const league = await this.leagueRepository.getDetailAsync(leagueId)
            if (league) {
                const msg = `League Creation Failed - leagueId: ${leagueId} already exists`
                throw new DuplicateError(msg, { leagueId })
            }

            // check for existence of league portfolio (shouldn't exist if league doesn't exist)
            const portfolioId = `league::${leagueId}`
            const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
            if (portfolio) {
                const msg = `League Creation Failed - League portfolioId: ${portfolioId} already exists`
                throw new ConflictError(msg, { portfolioId })
            }
        }

        const league = await this.createLeagueImpl(payload)

        return league
    }

    async deleteLeague(leagueId: string) {
        let ids = this.assetRepository.isLeagueUsed(leagueId)
        if (ids) {
            throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${ids}`)
        }

        const league = await this.leagueRepository.getDetailAsync(leagueId)
        if (league) {
            const portfolioId = league.portfolioId
            await this.leagueRepository.deleteAsync(leagueId)
            await this.portfolioService.deletePortfolio(portfolioId)
        }
    }

    async scrubLeague(leagueId: string) {
        // scrub all of the owned assets
        const managedAssetIds = await this.assetRepository.getLeagueAssetsAsync(leagueId)

        const promises: any[] = []
        managedAssetIds.forEach((asset) => {
            promises.push(this.scrubLeagueAsset(asset.id))
        })

        // scrub the associated portfolio
        const portfolioId = `league::${leagueId}`
        promises.push(this.portfolioService.scrubPortfolio(portfolioId))

        // scrub the contraact
        promises.push(this.leagueRepository.deleteAsync(leagueId))

        await Promise.all(promises)
    }

    async scrubLeagueAsset(assetId: string) {
        const promises: any[] = []
        promises.push(this.makerService.scrubMaker(assetId))
        promises.push(this.assetService.scrubAsset(assetId))
        return Promise.all(promises)
    }

    async newAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this.newAssetImpl(league, assetDef)
    }

    ///////////////////////////////////////////////////////
    // PRIVATE
    ///////////////////////////////////////////////////////

    private async createLeagueImpl(payload: TNewLeague) {
        const league = League.newLeague(payload)
        const portfolioId = await this.createLeaguePortfolioImpl(league)
        league.portfolioId = portfolioId
        await this.leagueRepository.storeAsync(league)
        return league
    }

    private async createLeaguePortfolioImpl(league: League) {
        const displayName = `${league.displayName} value portfolio`

        const leaguePortfolioDef = {
            type: 'league',
            portfolioId: `league::${league.leagueId}`,
            ownerId: league.ownerId,
            displayName: displayName,
            tags: {
                source: 'CONTRACT_CREATION',
            },
        }

        const portfolio = await this.portfolioService.newPortfolio(leaguePortfolioDef)
        return portfolio.portfolioId
    }

    private async newAssetImpl(league: League, assetDef: TLeagueAssetDef) {
        const initialPrice = assetDef.initialPrice
        const displayName = assetDef.displayName
        const assetSymbol = `${assetDef.assetId}`

        const assetConfig: TNewAsset = {
            ownerId: league.ownerId,
            symbol: assetSymbol,
            displayName: displayName,
            leagueId: league.leagueId,
            leagueDisplayName: league.displayName,
            //initialPrice: initialPrice,
        }

        try {
            const asset = await this.assetService.newAsset(assetConfig)
            console.log(`new asset: ${asset.assetId} `)
            await this.addAssetToLeague(league, asset)

            const makerProps: TNewMaker = {
                type: 'logisticmaker1',
                ownerId: league.ownerId,
                assetId: assetSymbol,
                settings: {
                    initPrice: initialPrice,
                    limit: 640,
                    coinPool: 500 * 10000,

                    // EJH: New Asset Maker Props set here.
                },

                // initialPoolUnits: 1000, // EJH: Just to get started.
            }
            await this.makerService.newMaker(makerProps)
        } catch (err) {
            console.log(`new asset error: ${assetConfig.symbol} - ${err}`)
        }
    }

    private async addAssetToLeague(league: League, asset: TAsset) {
        await this.leagueRepository.addLeagueAsset(league.leagueId, asset)
    }

    // async setupLeagueEarnerList(leagueSpec: string | League, assetList: TLeagueAssetDef[]) {
    //     const league =
    //         typeof leagueSpec === 'string' ? await this.leagueRepository.getLeague(leagueSpec) : leagueSpec
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueSpec}`)
    //     }

    //     if (assetList && assetList.length > 0) {
    //         await Promise.all(
    //             assetList.map((playerData: TLeagueAssetDef) => {
    //                 return this.newAssetImpl(league, playerData)
    //             }),
    //         )
    //     }
    // }

    // create a simple asset (coin) that has no maker, no start, no end, no terms.
    // async newSimpleAsset(leagueSpec: string | League, type: string, symbol: string) {
    //     const league =
    //         typeof leagueSpec === 'string' ? await this.leagueRepository.getLeague(leagueSpec) : leagueSpec
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueSpec}`)
    //     }

    //     const fullSymbol = `${type}::${symbol}`
    //     const displayName = symbol.charAt(0).toUpperCase() + symbol.slice(1) // capitalize
    //     const assetConfig: TNewAsset = {
    //         ownerId: league.ownerId,
    //         symbol: fullSymbol,
    //         displayName: displayName,
    //         leagueId: league.leagueId,
    //         leagueDisplayName: league.displayName,
    //         initialPrice: 1,
    //     }
    //     const asset = await this.assetService.newAsset(assetConfig)

    //     await this.addAssetToLeague(league, asset)

    //     return asset
    // }

    // async fundLeagueAsync(leagueSpec: string | League, units: number) {
    //     const league =
    //         typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueSpec}`)
    //     }
    //     return this.fundLeagueImplAsync(league, units)
    // }

    // async getLeagueFunds(leagueSpec: string | League) {
    //     const league =
    //         typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueSpec}`)
    //     }
    //     const balance = this.portfolioHoldingsService.getPortfolioHoldingsBalance(league.portfolioId, league.currencyId)
    //     return balance
    // }

    // async getAssetUnitsIssued(assetSpec: string | TAssetCache) {
    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }
    //     const assetId = asset.assetId

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getDetailAsync(leagueId)
    //     if (!league) {
    //         const msg = `Cannot get balance. league: ${leagueId} does not exist`
    //         throw new NotFoundError(msg, { leagueId })
    //     }
    //     const portfolioId = league.portfolioId

    //     const par = await this.portfolioHoldingsRepository.getDetailAsync(portfolioId, assetId)
    //     if (!par) {
    //         return 0
    //     } else {
    //         return par.units
    //     }
    // }

    // async buyLeagueAsset(
    //     portfolioSpec: string | TPortfolioRepository,
    //     assetSpec: string | TAssetCache,
    //     units: number,
    //     cost: number,
    // ) {
    //     const portfolio =
    //         typeof portfolioSpec === 'string' ? await this.portfolioRepository.getDetailAsync(portfolioSpec) : portfolioSpec
    //     if (!portfolio) {
    //         const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
    //         throw new NotFoundError(msg, { portfolioSpec })
    //     }
    //     const portfolioId = portfolio.portfolioId

    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }
    //     const assetId = asset.assetId

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getDetailAsync(leagueId)
    //     if (!league) {
    //         const msg = `Cannot transaction with league: ${leagueId} does not exist`
    //         throw new NotFoundError(msg, { leagueId })
    //     }

    //     const leaguePortfolioId = league.portfolioId

    //     const data: TPurchase = {
    //         buyerPorfolioId: portfolioId,
    //         sellerPortfolioId: leaguePortfolioId,
    //         assetId: assetId,
    //         units: units,
    //         coins: cost,
    //     }

    //     await this.transactionService.newPurchaseAsync(data)
    // }

    // async sellAssetToLeague(
    //     portfolioSpec: string | TPortfolioRepository,
    //     assetSpec: string | TAssetCache,
    //     units: number,
    //     cost: number,
    // ) {
    //     this.logger.trace(
    //         `enter sellAssetToLeague(${portfolioSpec}, ${JSON.stringify(assetSpec)}, ${units}, ${cost})`,
    //     )
    //     const portfolio =
    //         typeof portfolioSpec === 'string' ? await this.portfolioRepository.getDetailAsync(portfolioSpec) : portfolioSpec
    //     if (!portfolio) {
    //         const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
    //         throw new NotFoundError(msg, { portfolioSpec })
    //     }

    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getLeague(leagueId)
    //     if (!league) {
    //         const msg = `Cannot transaction with league: ${leagueId} does not exist`
    //         throw new NotFoundError(msg, { leagueId })
    //     }

    //     return this.sellAssetToLeagueImpl(portfolio, league, asset, units, cost)
    // }

    // async mintLeagueAssetUnitsToPortfolio(
    //     portfolioSpec: string | TPortfolioRepository,
    //     assetSpec: string | TAsset,
    //     units: number,
    // ) {
    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }

    //     const portfolio =
    //         typeof portfolioSpec === 'string' ? await this.portfolioRepository.getDetailAsync(portfolioSpec) : portfolioSpec
    //     if (!portfolio) {
    //         const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
    //         throw new NotFoundError(msg, { portfolioSpec })
    //     }

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getLeague(leagueId)
    //     if (!league) {
    //         const msg = `Cannot mint to portfolio: ${leagueId} does not exist`
    //         throw new NotFoundError(msg, { leagueId })
    //     }

    //     return this.mintLeagueAssetUnitsToPortfolioImpl(portfolio, asset, units)
    // }

    // async redeemPortfolioHolding(portfolioSpec: string | TPortfolioRepository, assetSpec: string | TAsset, units: number) {
    //     const portfolio =
    //         typeof portfolioSpec === 'string' ? await this.portfolioRepository.getDetailAsync(portfolioSpec) : portfolioSpec
    //     if (!portfolio) {
    //         const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
    //         throw new NotFoundError(msg, { portfolioSpec })
    //     }
    //     const portfolioId = portfolio.portfolioId

    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }
    //     const assetId = asset.assetId

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getDetailAsync(leagueId)
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueId}`)
    //     }

    //     // don't redeem anything if the holder portfolio is the league's portfilio
    //     if (league.portfolioId === portfolio.portfolioId) {
    //         return
    //     }

    //     const holdingAsset = await this.portfolioHoldingsRepository.getPortfolioHoldings(portfolioId, assetId)
    //     if (!holdingAsset) {
    //         throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`)
    //     }

    //     if (holdingAsset.units < units) {
    //         throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`)
    //     }

    //     // cumulativeEarnings must be positive (or 0)
    //     this.logger.trace(asset)
    //     const cumulativeEarnings = Math.max(asset.cumulativeEarnings || 0, 0)
    //     const coinUnits = units * cumulativeEarnings

    //     // league buy back asset
    //     return this.sellAssetToLeague(portfolio, asset, units, coinUnits)
    // }

    // async redeemAsset(assetSpec: string) {
    //     this.logger.trace(`enter redeemAsset(${assetSpec})`)
    //     const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
    //     if (!asset) {
    //         throw new Error(`Asset Not Found: ${assetSpec}`)
    //     }
    //     const assetId = asset.assetId

    //     const leagueId = asset.leagueId
    //     const league = await this.leagueRepository.getDetailAsync(leagueId)
    //     if (!league) {
    //         throw new Error(`League Not Found: ${leagueId}`)
    //     }

    //     const assetHolders = await this.assetHoldersRepository.get(assetId)
    //     if (!assetHolders || assetHolders.length === 0) {
    //         return
    //     }

    //     // for each holder, redeem their units.
    //     const promises: any[] = []

    //     assetHolders.map((assetHolder) => {
    //         const holderPortfolioId = assetHolder.portfolioId
    //         const units = assetHolder.units
    //         promises.push(this.redeemPortfolioHolding(holderPortfolioId, assetId, units))
    //     }),
    //         await Promise.all(promises)
    // }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    // private async sellAssetToLeagueImpl(
    //     portfolio: TPortfolioRepository,
    //     league: League,
    //     asset: TAssetCache,
    //     units: number,
    //     cost: number,
    // ) {
    //     const portfolioId = portfolio.portfolioId
    //     const assetId = asset.assetId

    //     const leaguePortfolioId = league.portfolioId

    //     const data: TPurchase = {
    //         buyerPorfolioId: leaguePortfolioId,
    //         sellerPortfolioId: portfolioId,
    //         assetId: assetId,
    //         units: units,
    //         coins: cost,
    //     }

    //     await this.transactionService.newPurchaseAsync(data)
    // }

    // private async mintLeagueAssetUnitsToPortfolioImpl(portfolio: TPortfolioRepository, asset: TAssetCache, units: number) {
    //     const portfolioId = portfolio.portfolioId
    //     const leagueId = asset.leagueId

    //     const league = await this.leagueRepository.getDetailAsync(leagueId)
    //     if (!league) {
    //         const msg = `Cannot mint to portfolio: ${leagueId} does not exist`
    //         throw new NotFoundError(msg, { leagueId })
    //     }
    //     const sourcePortfolioId = league.portfolioId

    //     const data: TTransfer = {
    //         inputPortfolioId: sourcePortfolioId,
    //         outputPortfolioId: portfolioId,
    //         assetId: asset.assetId,
    //         units: units,
    //     }
    //     return this.transactionService.newTransferAsync(data)
    // }
    // private async fundLeagueImplAsync(league: League, units: number) {
    //     const assetId = league.currencyId
    //     const sourcePortfolioId = league.currencySource
    //     const portfolioId = league.portfolioId

    //     const data: TTransfer = {
    //         inputPortfolioId: sourcePortfolioId,
    //         outputPortfolioId: portfolioId,
    //         assetId: assetId,
    //         units: units,
    //     }
    //     return this.transactionService.newTransferAsync(data)
    // }
}
