'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import * as firebase from 'firebase-admin'
import { DateTime } from 'luxon'

import { Contract } from '../../src/models'
import { ContractRepository } from '../../src/repositories'

describe('Contract Repository', () => {
    let contractRepository: ContractRepository
    const contractId = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        contractRepository = new ContractRepository(db)
    })

    beforeEach(async () => {
        await contractRepository.deleteContract(contractId)
    })

    describe('Create Basic Contract', () => {
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

            const contract = Contract.newContract(data)
            await contractRepository.storeContract(contract)

            const readBack = await contractRepository.getContract(contractId)
            expect(readBack).to.exist
            expect(readBack!!.ownerId).to.eq('tester')
            expect(readBack!!.portfolioId).to.eq(`contract::${contractId}`)
            expect(readBack!!.key).to.eq('seasons')
            expect(readBack!!.pt).to.eq(1)
        })
    })

    describe('Create Contract with Assets', () => {
        it('should create 1 managedAssets', async () => {
            const data = {
                ownerId: 'tester',
                contractId: contractId,
                portfolioId: `contract::${contractId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const contract = Contract.newContract(data)
            await contractRepository.storeContract(contract)

            await contractRepository.addContractAsset(contract.contractId, 'card::asset1')
            await contractRepository.addContractAsset(contract.contractId, 'card::asset2')

            const readBack = await contractRepository.getContract(contractId)
            expect(readBack).to.exist
            expect(readBack!!.managedAssets).to.be.instanceOf(Array)
            expect(readBack!!.managedAssets.length).to.eq(2)
        })
    })

    describe('Create Contract with Assets', () => {
        it('should delete managedAsset', async () => {
            const data = {
                ownerId: 'tester',
                contractId: contractId,
                portfolioId: `contract::${contractId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const contract = Contract.newContract(data)
            await contractRepository.storeContract(contract)

            await contractRepository.addContractAsset(contract.contractId, 'card::asset1')
            await contractRepository.addContractAsset(contract.contractId, 'card::asset2')

            await contractRepository.dropContractAsset(contract.contractId, 'card::asset1')

            const readBack = await contractRepository.getContract(contractId)
            expect(readBack).to.exist
            expect(readBack!!.managedAssets).to.be.instanceOf(Array)
            expect(readBack!!.managedAssets.length).to.eq(1)
            expect(readBack!!.managedAssets[0]).to.eq('card::asset2')
        })
    })
})
