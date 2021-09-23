'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { User, TNewUserConfig } from '../../src/models'
import { UserRepository } from '../../src/repositories'

describe('User Repository', () => {
    let userRepository: UserRepository

    before(async () => {
        userRepository = new UserRepository()
    })

    describe('Create Basic User', () => {
        it('should create', async () => {
            const data: TNewUserConfig = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            }

            const user = User.newUser(data)
            await userRepository.storeAsync(user)

            const userId = user.userId

            const readBack = await userRepository.getDetailAsync(userId)
            expect(readBack).to.exist
            expect(readBack!!.userId).to.exist

            await userRepository.deleteAsync(userId)
        })
    })

    describe('Create Full User', () => {
        it('should create', async () => {
            const data: TNewUserConfig = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
                displayName: 'aaa',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
            }

            const user = User.newUser(data)
            await userRepository.storeAsync(user)
            const userId = user.userId

            const readBack = await userRepository.getDetailAsync(userId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack.dob).to.eq('1/2/2021')
                expect(readBack.email).to.eq('bjcleaver@cleaver.com')
                expect(readBack.name).to.eq('Boris Cleaver')
                expect(readBack.username).to.eq('bjcleaver')
                expect(readBack.displayName).to.eq('aaa')
                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
            }
            await userRepository.deleteAsync(userId)
        })
    })

    describe('Filtered Users', () => {
        it('should list users', async () => {
            const users: User[] = []

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b1@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleaver1',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b2@cleaver.com',
                    name: 'Ben Cleaver',
                    username: 'bjcleaver2',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b3@cleaver.com',
                    name: 'Betty Cleaver',
                    username: 'bjcleaver3',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b4@cleaver.com',
                    name: 'Blake Cleaver',
                    username: 'bjcleaver4',
                }),
            )

            {
                const promises: any[] = []
                users.forEach((user) => {
                    promises.push(userRepository.storeAsync(user))
                })
                await Promise.all(promises)
            }

            const userList = await userRepository.getListAsync({ username: 'bjcleaver4' })
            expect(userList.length).to.eq(1)
            expect(userList[0].username).to.eql('bjcleaver4')

            {
                const promises: any[] = []
                users.forEach((user) => {
                    promises.push(userRepository.deleteAsync(user.userId))
                })
                await Promise.all(promises)
            }
        })
    })
})
