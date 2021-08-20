'use strict'

import { getLogger, Logger } from 'log4js'
// lint:disable: no-console

import { ConflictError, DuplicateError, NotFoundError } from '../errors'
import {
    Contract,
    TAsset,
    TAssetCache,
    TContractEarnerDef,
    TContractUpdate,
    TNewAsset,
    TNewContract,
    TPortfolioCache,
    TPurchase,
    TTransfer,
} from '../models'
import { PortfolioCache, AssetCache } from '../caches'
import { AssetRepository, ContractRepository, PortfolioAssetRepository, AssetHolderRepository } from '../repositories'
import {
    PortfolioService,
    PortfolioAssetService,
    TransactionService,
    AssetService,
    MakerService,
    IEventPublisher,
} from '../services'
import { TNewMaker } from 'makers'

export class ContractService {
    private db: FirebaseFirestore.Firestore
    private logger: Logger

    private assetRepository: AssetRepository
    private assetHolderRepository: AssetHolderRepository
    private assetCache: AssetCache
    private contractRepository: ContractRepository
    private portfolioCache: PortfolioCache
    private portfolioAssetRepository: PortfolioAssetRepository

    private portfolioService: PortfolioService
    private portfolioAssetService: PortfolioAssetService
    private transactionService: TransactionService
    private assetService: AssetService
    private makerService: MakerService

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.db = db
        this.logger = getLogger(this.constructor.name)

        this.assetRepository = new AssetRepository(db)
        this.assetHolderRepository = new AssetHolderRepository(db)
        this.assetCache = new AssetCache(db)
        this.contractRepository = new ContractRepository(db)
        this.portfolioCache = new PortfolioCache(db)
        this.portfolioAssetRepository = new PortfolioAssetRepository(db)

        this.portfolioService = new PortfolioService(db, eventPublisher)
        this.portfolioAssetService = new PortfolioAssetService(db, eventPublisher)
        this.transactionService = new TransactionService(db, eventPublisher)
        this.assetService = new AssetService(db, eventPublisher)
        this.makerService = new MakerService(db, eventPublisher)
    }

    async newContract(payload: TNewContract) {
        const contractId = payload.contractId

        if (contractId) {
            // check for existing contract with that Id. If exists, then fail out.
            const contract = await this.contractRepository.getContract(contractId)
            if (contract) {
                const msg = `Contract Creation Failed - contractId: ${contractId} already exists`
                throw new DuplicateError(msg, { contractId })
            }

            // check for existence of contract portfolio (shouldn't exist if contract doesn't exist)
            const portfolioId = `contract::${contractId}`
            const portfolio = await this.portfolioCache.lookupPortfolio(portfolioId)
            if (portfolio) {
                const msg = `Contract Creation Failed - Contract portfolioId: ${portfolioId} already exists`
                throw new ConflictError(msg, { portfolioId })
            }
        }

        const contract = await this.createContractImpl(payload)

        return contract
    }

    async deleteContract(contractId: string) {
        {
            // check for linked assets
            const entityRefCollection = this.db.collection('assets').where('contractId', '==', contractId)
            const entityCollectionRefs = await entityRefCollection.get()
            if (entityCollectionRefs.size > 0) {
                const assetIds = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data()
                    return data.assetId
                })
                const assetIdList = assetIds.join(', ')
                throw new ConflictError(`Asset in use: ${assetIdList}`)
            }
        }

        const contract = await this.contractRepository.getContract(contractId)
        if (contract) {
            const portfolioId = contract.portfolioId

            await this.contractRepository.deleteContract(contractId)

            await this.portfolioService.deletePortfolio(portfolioId)
        }
    }

    async scrubContract(contractId: string) {
        // scrub all of the owned assets
        const managedAssetIds = await this.assetRepository.listContractAssets(contractId)

        const promises: any[] = []
        managedAssetIds.forEach((assetId) => {
            promises.push(this.scrubContractAsset(assetId))
        })

        // scrub the associated portfolio
        const portfolioId = `contract::${contractId}`
        promises.push(this.portfolioService.scrubPortfolio(portfolioId))

        // scrub the contraact
        promises.push(this.contractRepository.deleteContract(contractId))

        await Promise.all(promises)
    }

    async scrubContractAsset(assetId: string) {
        const promises: any[] = []
        promises.push(this.makerService.scrubMaker(assetId))
        promises.push(this.assetService.scrubAsset(assetId))
        return Promise.all(promises)
    }

    async setupContractEarnerList(contractSpec: string | Contract, assetList: TContractEarnerDef[]) {
        const contract =
            typeof contractSpec === 'string' ? await this.contractRepository.getContract(contractSpec) : contractSpec
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractSpec}`)
        }

        if (assetList && assetList.length > 0) {
            await Promise.all(
                assetList.map((playerData: TContractEarnerDef) => {
                    return this.newAssetImpl(contract, playerData)
                }),
            )
        }
    }

    // create a simple asset (coin) that has no maker, no start, no end, no terms.
    async newSimpleAsset(contractSpec: string | Contract, type: string, symbol: string) {
        const contract =
            typeof contractSpec === 'string' ? await this.contractRepository.getContract(contractSpec) : contractSpec
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractSpec}`)
        }

        const fullSymbol = `${type}::${symbol}`
        const displayName = symbol.charAt(0).toUpperCase() + symbol.slice(1) // capitalize
        const assetConfig: TNewAsset = {
            ownerId: contract.ownerId,
            symbol: fullSymbol,
            displayName: displayName,
            contractId: contract.contractId,
            contractDisplayName: contract.displayName,
            initialPrice: 1,
        }
        const asset = await this.assetService.newAsset(assetConfig)

        await this.addAssetToContract(contract, asset)

        return asset
    }

    async newAsset(contractSpec: string | Contract, assetDef: TContractEarnerDef) {
        const contract =
            typeof contractSpec === 'string' ? await this.contractRepository.getContract(contractSpec) : contractSpec
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractSpec}`)
        }

        await this.newAssetImpl(contract, assetDef)
    }

    async fundContractAsync(contractSpec: string | Contract, units: number) {
        const contract =
            typeof contractSpec === 'string' ? await this.contractRepository.getContract(contractSpec) : contractSpec
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractSpec}`)
        }
        return this.fundContractImplAsync(contract, units)
    }

    async getContractFunds(contractSpec: string | Contract) {
        const contract =
            typeof contractSpec === 'string' ? await this.contractRepository.getContract(contractSpec) : contractSpec
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractSpec}`)
        }
        const balance = this.portfolioAssetService.getPortfolioAssetBalance(contract.portfolioId, contract.currencyId)
        return balance
    }

    async getAssetUnitsIssued(assetSpec: string | TAssetCache) {
        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }
        const assetId = asset.assetId

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            const msg = `Cannot get balance. contract: ${contractId} does not exist`
            throw new NotFoundError(msg, { contractId })
        }
        const portfolioId = contract.portfolioId

        const par = await this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId)
        if (!par) {
            return 0
        } else {
            return par.units
        }
    }

    async buyContractAsset(
        portfolioSpec: string | TPortfolioCache,
        assetSpec: string | TAssetCache,
        units: number,
        cost: number,
    ) {
        const portfolio =
            typeof portfolioSpec === 'string' ? await this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec
        if (!portfolio) {
            const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
            throw new NotFoundError(msg, { portfolioSpec })
        }
        const portfolioId = portfolio.portfolioId

        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }
        const assetId = asset.assetId

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            const msg = `Cannot transaction with contract: ${contractId} does not exist`
            throw new NotFoundError(msg, { contractId })
        }

        const contractPortfolioId = contract.portfolioId

        const data: TPurchase = {
            buyerPorfolioId: portfolioId,
            sellerPortfolioId: contractPortfolioId,
            assetId: assetId,
            units: units,
            coins: cost,
        }

        await this.transactionService.newPurchaseAsync(data)
    }

    async sellAssetToContract(
        portfolioSpec: string | TPortfolioCache,
        assetSpec: string | TAssetCache,
        units: number,
        cost: number,
    ) {
        this.logger.trace(
            `enter sellAssetToContract(${portfolioSpec}, ${JSON.stringify(assetSpec)}, ${units}, ${cost})`,
        )
        const portfolio =
            typeof portfolioSpec === 'string' ? await this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec
        if (!portfolio) {
            const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
            throw new NotFoundError(msg, { portfolioSpec })
        }

        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            const msg = `Cannot transaction with contract: ${contractId} does not exist`
            throw new NotFoundError(msg, { contractId })
        }

        return this.sellAssetToContractImpl(portfolio, contract, asset, units, cost)
    }

    async mintContractAssetUnitsToPortfolio(
        portfolioSpec: string | TPortfolioCache,
        assetSpec: string | TAsset,
        units: number,
    ) {
        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }

        const portfolio =
            typeof portfolioSpec === 'string' ? await this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec
        if (!portfolio) {
            const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
            throw new NotFoundError(msg, { portfolioSpec })
        }

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            const msg = `Cannot mint to portfolio: ${contractId} does not exist`
            throw new NotFoundError(msg, { contractId })
        }

        return this.mintContractAssetUnitsToPortfolioImpl(portfolio, asset, units)
    }

    async redeemPortfolioHolding(portfolioSpec: string | TPortfolioCache, assetSpec: string | TAsset, units: number) {
        const portfolio =
            typeof portfolioSpec === 'string' ? await this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec
        if (!portfolio) {
            const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`
            throw new NotFoundError(msg, { portfolioSpec })
        }
        const portfolioId = portfolio.portfolioId

        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }
        const assetId = asset.assetId

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractId}`)
        }

        // don't redeem anything if the holder portfolio is the contract's portfilio
        if (contract.portfolioId === portfolio.portfolioId) {
            return
        }

        const holdingAsset = await this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId)
        if (!holdingAsset) {
            throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`)
        }

        if (holdingAsset.units < units) {
            throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`)
        }

        // cumulativeEarnings must be positive (or 0)
        this.logger.trace(asset)
        const cumulativeEarnings = Math.max(asset.cumulativeEarnings || 0, 0)
        const coinUnits = units * cumulativeEarnings

        // contract buy back asset
        return this.sellAssetToContract(portfolio, asset, units, coinUnits)
    }

    async redeemAsset(assetSpec: string) {
        this.logger.trace(`enter redeemAsset(${assetSpec})`)
        const asset = typeof assetSpec === 'string' ? await this.assetCache.lookupAsset(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }
        const assetId = asset.assetId

        const contractId = asset.contractId
        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            throw new Error(`Contract Not Found: ${contractId}`)
        }

        const assetHolders = await this.assetHolderRepository.listAssetHolders(assetId)
        if (!assetHolders || assetHolders.length === 0) {
            return
        }

        // for each holder, redeem their units.
        const promises: any[] = []

        assetHolders.map((assetHolder) => {
            const holderPortfolioId = assetHolder.portfolioId
            const units = assetHolder.units
            promises.push(this.redeemPortfolioHolding(holderPortfolioId, assetId, units))
        }),
            await Promise.all(promises)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createContractImpl(payload: TNewContract) {
        const contract = Contract.newContract(payload)
        const portfolioId = await this.createContractPortfolioImpl(contract)
        contract.portfolioId = portfolioId
        await this.contractRepository.storeContract(contract)
        return contract
    }

    private async createContractPortfolioImpl(contract: Contract) {
        const displayName = `${contract.displayName} value portfolio`

        const contractPortfolioDef = {
            type: 'contract',
            portfolioId: `contract::${contract.contractId}`,
            ownerId: contract.ownerId,
            displayName: displayName,
            tags: {
                source: 'CONTRACT_CREATION',
            },
        }

        const portfolio = await this.portfolioService.newPortfolio(contractPortfolioDef)
        return portfolio.portfolioId
    }

    private async sellAssetToContractImpl(
        portfolio: TPortfolioCache,
        contract: Contract,
        asset: TAssetCache,
        units: number,
        cost: number,
    ) {
        const portfolioId = portfolio.portfolioId
        const assetId = asset.assetId

        const contractPortfolioId = contract.portfolioId

        const data: TPurchase = {
            buyerPorfolioId: contractPortfolioId,
            sellerPortfolioId: portfolioId,
            assetId: assetId,
            units: units,
            coins: cost,
        }

        await this.transactionService.newPurchaseAsync(data)
    }

    private async mintContractAssetUnitsToPortfolioImpl(portfolio: TPortfolioCache, asset: TAssetCache, units: number) {
        const portfolioId = portfolio.portfolioId
        const contractId = asset.contractId

        const contract = await this.contractRepository.getContract(contractId)
        if (!contract) {
            const msg = `Cannot mint to portfolio: ${contractId} does not exist`
            throw new NotFoundError(msg, { contractId })
        }
        const sourcePortfolioId = contract.portfolioId

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: asset.assetId,
            units: units,
        }
        return this.transactionService.newTransferAsync(data)
    }

    private async newAssetImpl(contract: Contract, assetDef: TContractEarnerDef) {
        const earnerSymbol = assetDef.earnerId
        const initialPrice = assetDef.initialPrice
        const displayName = assetDef.displayName
        const assetSymbol = `${earnerSymbol}::${contract.contractId}`

        const assetConfig: TNewAsset = {
            ownerId: contract.ownerId,
            symbol: assetSymbol,
            displayName: displayName,
            initialPrice: initialPrice,
            contractId: contract.contractId,
            contractDisplayName: contract.displayName,
            earnerId: earnerSymbol,
            earnerDisplayName: displayName,
        }

        try {
            const asset = await this.assetService.newAsset(assetConfig)
            console.log(`new asset: ${asset.assetId} `)
            await this.addAssetToContract(contract, asset)

            const makerProps: TNewMaker = {
                type: 'logisticmaker1',
                ownerId: contract.ownerId,
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

    private async addAssetToContract(contract: Contract, asset: TAssetCache) {
        await this.contractRepository.addContractAsset(contract.contractId, asset.assetId)

        // const contractId = contract.contractId
        // const currentList = contract.managedAssets || []
        // currentList.push(asset.assetId)
        // const data: TContractUpdate = { managedAssets: currentList }
        // await this.contractRepository.updateContract(contractId, data)
    }

    private async fundContractImplAsync(contract: Contract, units: number) {
        const assetId = contract.currencyId
        const sourcePortfolioId = contract.currencySource
        const portfolioId = contract.portfolioId

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: assetId,
            units: units,
        }
        return this.transactionService.newTransferAsync(data)
    }
}
