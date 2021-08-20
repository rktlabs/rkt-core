'use strict'

import { AssetRepository, EarnerRepository, PortfolioRepository } from '../repositories'
import {
    PortfolioService,
    IEventPublisher,
    ContractService,
    PortfolioAssetService,
    EarnerService,
    TransactionService,
} from '../services'
import { deleteCollection } from '../util/deleters'
import * as firebase from 'firebase-admin'

export class BootstrapService {
    private db: FirebaseFirestore.Firestore
    private earnerRepository: EarnerRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioService
    private earnerService: EarnerService
    private contractService: ContractService
    private portfolioAssetService: PortfolioAssetService
    private transactionService: TransactionService

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.db = db

        this.assetRepository = new AssetRepository(db)
        this.earnerRepository = new EarnerRepository(db)
        this.portfolioRepository = new PortfolioRepository(db)

        this.earnerService = new EarnerService(db, eventPublisher)
        this.portfolioService = new PortfolioService(db, eventPublisher)
        this.portfolioAssetService = new PortfolioAssetService(db, eventPublisher)
        this.contractService = new ContractService(db, eventPublisher)
        this.transactionService = new TransactionService(db, eventPublisher)
    }

    // bootstrap the system with the "mint" contract and the "coin" asset
    async bootMint() {
        const mintContract = await this.contractService.newContract({
            ownerId: 'system',
            contractId: 'mint',
        })

        await this.contractService.newSimpleAsset(mintContract, 'coin', 'fantx')
    }

    async bootTestContract() {
        await this.contractService.newContract({
            ownerId: 'test',
            contractId: 'test',
        })
    }

    async bootstrap() {
        await Promise.all([this.bootMint(), this.bootTestContract()])
    }

    async setupTestAsset() {
        const contractId = 'test'
        const earnerId = 'card::jbone'
        let earner = await this.earnerRepository.getEarner(earnerId)
        if (!earner) {
            earner = await this.earnerService.newEarner({
                ownerId: 'tester',
                symbol: earnerId,
                displayName: 'Jbone Genie',
            })
        }

        const assetId = `${earnerId}::${contractId}`
        let asset = await this.assetRepository.getAsset(assetId)
        if (!asset) {
            await this.contractService.newAsset(contractId, {
                earnerId: earnerId,
                initialPrice: 11,
                displayName: earner.displayName,
            })
        }
    }

    async setupAccount() {
        let portfolio = await this.portfolioRepository.getPortfolio('user::hedbot')
        if (!portfolio) {
            await this.portfolioService.createPortfolio({
                type: 'user',
                ownerId: 'test',
                portfolioId: 'user::hedbot',
            })
        }
    }

    async setupTreasury() {
        let portfolio = await this.portfolioRepository.getPortfolio('bank::treasury')
        if (!portfolio) {
            await this.portfolioService.createPortfolio({
                type: 'bank',
                ownerId: 'test',
                portfolioId: 'bank::treasury',
            })
        }

        await this.transactionService.mintCoinsToPortfolio('bank::treasury', 1000000)
    }

    async fullBoot() {
        await this.bootstrap()
        await Promise.all([this.setupTestAsset(), this.setupAccount()])
    }

    async scrub() {
        // scrub asset first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.contractService.scrubContract('test'), // scrubs coin too
            this.contractService.scrubContract('mint'), // scrubs coin too
        ])
        await Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')])
    }

    async clearHoldings() {
        // scrub asset holders first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.portfolioAssetService.scrubAssetHolders('coin::fantx'),
            this.portfolioAssetService.scrubAssetHolders('card::jbone::test'),
        ])
        await Promise.all([
            this.portfolioAssetService.scrubPortfolioAssets('user::hedbot'),
            this.portfolioAssetService.scrubPortfolioAssets('contract::mint'),
            this.portfolioAssetService.scrubPortfolioAssets('contract::test'),
        ])
    }

    async clearDb() {
        const targets = [
            'earners',
            'portfolios',
            'portfolioCache',
            'assets',
            'assetCache',
            'makers',
            'contracts',
            'transactions',
            'exchangeOrders',
            'exchangeTrades',
            'users',
        ]

        ////////////////////////////////////////////
        // ONLY CLEAR TEST DB
        ////////////////////////////////////////////
        if (firebase.apps[0]!!.options.databaseURL !== 'https://fantx-test.firebaseio.com') {
            throw new Error('Cannot clear non-test database')
        }

        const promises: any[] = []
        targets.forEach((target) => {
            const entityRef = this.db.collection(target)
            promises.push(deleteCollection(entityRef))
        })

        await Promise.all(promises)
    }
}
