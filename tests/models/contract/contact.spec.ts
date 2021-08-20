'use strict'
/* eslint-env node, mocha */
import { DateTime } from 'luxon'
import { expect } from 'chai'

import { Contract, TNewContract } from '../../../src/models'

describe('Contract', () => {
    const contractId = 'my-contract'

    describe('Create New Contract', () => {
        it('no displayname should default to contractId', async () => {
            const data: TNewContract = {
                ownerId: 'tester',
                contractId: contractId,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const contract = Contract.newContract(data)
            expect(contract.displayName).to.eq(contractId)
        })

        it('use displayName if supplied', async () => {
            const displayName = 'thisisme'

            const data: TNewContract = {
                ownerId: 'tester',
                contractId: contractId,
                displayName: displayName,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const contract = Contract.newContract(data)
            expect(contract.displayName).to.eq(displayName)
        })
    })
})
