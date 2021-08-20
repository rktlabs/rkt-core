'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { DateTime } from 'luxon'

import * as firebase from 'firebase-admin'

import * as sinon from 'sinon'

import { ContractService, EventPublisher, BootstrapService } from '../../src/services'
import { ContractRepository, PortfolioRepository, AssetRepository } from '../../src/repositories'
import { PortfolioAssetService, TContractEarnerDef } from '../../src'

describe('Contract Service', function () {
    this.timeout(5000)

    let contractRepository: ContractRepository
    let assetRepository: AssetRepository
    let profileRepository: PortfolioRepository

    let portfolioAssetService: PortfolioAssetService
    let contractService: ContractService
    let boostrapService: BootstrapService

    let contractId: string = 'testcontract1'

    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        contractRepository = new ContractRepository(db)
        profileRepository = new PortfolioRepository(db)
        assetRepository = new AssetRepository(db)

        portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
        contractService = new ContractService(db, eventPublisher as any as EventPublisher)
        boostrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
    })

    beforeEach(async () => {
        await boostrapService.clearDb()
        sinon.resetHistory()
    })

    describe('Create Basic Contract', () => {
        beforeEach(async () => {
            await contractService.scrubContract(contractId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                contractId: contractId,
                portfolioId: `contract::${contractId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            await contractService.newContract(data)

            const contract = await contractRepository.getContract(contractId)
            expect(contract).to.exist
            expect(contract!!.contractId).to.be.eq(contractId)

            const portfolioId = `contract::${contractId}`
            expect(contract!!.portfolioId).to.be.eq(portfolioId)

            const profile = await profileRepository.getPortfolio(portfolioId)
            expect(profile).to.exist
            expect(profile!!.portfolioId).to.be.eq(portfolioId)
        })
    })

    describe.only('Delete Empty Contract', () => {
        beforeEach(async () => {
            await contractService.scrubContract(contractId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                contractId: contractId,
                portfolioId: `contract::${contractId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const contract = await contractService.newContract(data)
            await contractService.deleteContract(contract.contractId)

            const readBack = await contractRepository.getContract(contractId)

            expect(readBack).to.not.exist
        })
    })

    describe('Create Assets', () => {
        let contractId: string = 'testcontract1'
        let assetList: TContractEarnerDef[] = [
            { earnerId: 'card::aaa', initialPrice: 10, displayName: 'helloa' },
            { earnerId: 'card::bbb', initialPrice: 20, displayName: 'hellob' },
            { earnerId: 'card::ccc', initialPrice: 30, displayName: 'helloc' },
            { earnerId: 'card::ddd', initialPrice: 40, displayName: 'hellod' },
        ]

        beforeEach(async () => {
            await contractService.scrubContract(contractId)

            await contractService.newContract({
                ownerId: 'tester',
                contractId: contractId,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
                earnerList: assetList,
            })
        })

        it('should create asset list', async () => {
            await contractService.setupContractEarnerList(contractId, assetList)

            const [asset1, asset2, asset3, asset4] = await Promise.all([
                assetRepository.getAsset('card::aaa::testcontract1'),
                assetRepository.getAsset('card::bbb::testcontract1'),
                assetRepository.getAsset('card::ccc::testcontract1'),
                assetRepository.getAsset('card::ddd::testcontract1'),
            ])
            expect(asset1).to.exist
            expect(asset2).to.exist
            expect(asset3).to.exist
            expect(asset4).to.exist
        })
    })

    describe('Mint Asset Units to portfolio', () => {
        it('should move asset units from asset contract to portfolio', async () => {
            await boostrapService.fullBoot()
            await contractService.mintContractAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', 10)

            // verify that treasury has balance of 10
            expect(await portfolioAssetService.getPortfolioAssetBalance('user::hedbot', 'card::jbone::test')).to.eq(10)

            // verify that mint has balance of -10
            expect(await portfolioAssetService.getPortfolioAssetBalance('contract::test', 'card::jbone::test')).to.eq(
                -10,
            )

            //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
            expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
            expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
        })
    })
})
