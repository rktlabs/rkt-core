'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env node, mocha */
const chai_1 = require("chai");
const src_1 = require("../../src");
const bootstrapService_1 = require("../../src/maint/bootstrapService");
describe.skip('User Service', function () {
    this.timeout(5000);
    let userRepository;
    let portfolioRepository;
    let userService;
    const userTemplate = {
        dob: '1/2/2021',
        email: 'bjcleavertest@cleaver.com',
        name: 'Boris Cleaver',
        username: 'bjcleavertest',
    };
    before(() => __awaiter(this, void 0, void 0, function* () {
        userRepository = new src_1.UserRepository();
        portfolioRepository = new src_1.PortfolioRepository();
        userService = new src_1.UserService();
    }));
    describe('User Service Simple', () => {
        let userId;
        afterEach(() => __awaiter(this, void 0, void 0, function* () {
            yield userService.deleteUser(userId);
        }));
        describe('Create Basic User - with portfolio', () => {
            it('should create', () => __awaiter(this, void 0, void 0, function* () {
                const user = yield userService.createUser(userTemplate);
                userId = user.userId;
                const readBack = yield userRepository.getDetailAsync(user.userId);
                (0, chai_1.expect)(readBack).to.exist;
                const portfolioId = readBack.portfolioId;
                (0, chai_1.expect)(portfolioId).to.exist;
                const portfolio = yield portfolioRepository.getDetailAsync(portfolioId);
                (0, chai_1.expect)(portfolio).to.exist;
            }));
        });
        describe('Create Basic User - with userId supplied', () => {
            it('should create', () => __awaiter(this, void 0, void 0, function* () {
                const userTemplate2 = {
                    userId: '12345',
                    dob: '1/2/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleavertest',
                };
                const user = yield userService.createUser(userTemplate2);
                userId = user.userId;
                (0, chai_1.expect)(userId).to.eq('12345');
                const readBack = yield userRepository.getDetailAsync(user.userId);
                (0, chai_1.expect)(readBack).to.exist;
                const portfolioId = readBack.portfolioId;
                (0, chai_1.expect)(portfolioId).to.exist;
                const portfolio = yield portfolioRepository.getDetailAsync(portfolioId);
                (0, chai_1.expect)(portfolio).to.exist;
            }));
        });
        describe('Create User where username already exists', () => {
            it('should fail with exception', () => __awaiter(this, void 0, void 0, function* () {
                const user = yield userService.createUser({
                    dob: '1/2/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleavertest',
                });
                userId = user.userId;
                const data2 = {
                    dob: '1/3/2021',
                    email: 'jcleave@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'bjcleaver',
                };
                yield userService
                    .createUser(data2)
                    .then(() => {
                    chai_1.assert.fail('Function should not complete');
                })
                    .catch((error) => {
                    (0, chai_1.expect)(error).to.be.instanceOf(Error);
                    (0, chai_1.expect)(error.message).to.eq('User Creation Failed - username: bjcleaver already exists');
                });
            }));
        });
        describe('Create User where email already exists', () => {
            it('should fail with exception', () => __awaiter(this, void 0, void 0, function* () {
                const user = yield userService.createUser(userTemplate);
                userId = user.userId;
                const data2 = {
                    dob: '1/3/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'jjcleaver',
                };
                yield userService
                    .createUser(data2)
                    .then(() => {
                    chai_1.assert.fail('Function should not complete');
                })
                    .catch((error) => {
                    (0, chai_1.expect)(error).to.be.instanceOf(Error);
                    (0, chai_1.expect)(error.message).to.eq('User Creation Failed - email: bjcleaver@cleaver.com already exists');
                });
            }));
        });
    });
    describe('User Service Boot', () => {
        let bootstrapper;
        let assetHolderService;
        let userId;
        before(() => __awaiter(this, void 0, void 0, function* () {
            assetHolderService = new src_1.AssetHolderService();
            bootstrapper = new bootstrapService_1.BootstrapService();
        }));
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            //await userService.deleteUser(userId)
            //await bootstrapper.clearDb()
            yield bootstrapper.bootstrap();
            //await bootstrapper.setupTreasury()
        }));
        afterEach(() => __awaiter(this, void 0, void 0, function* () {
            //await userService.deleteUser(userId)
        }));
        // describe('Create User with Initial Coins', () => {
        //     it('should deposit', async () => {
        //         const depositUnits = 100
        //         const newTemplate = Object.assign({}, userTemplate, { initialCoins: depositUnits })
        //         const user = await userService.newUser(newTemplate)
        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')
        //         expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
        //     })
        // })
        // describe('Deposit Coin with User', () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id
        //         const treasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )
        //         const depositUnits = 100
        //         await userService.depositCoins(user.userId, depositUnits)
        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')
        //         const remainingTreasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )
        //         expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
        //         expect(treasuryUnits - remainingTreasuryUnits).to.eq(depositUnits, 'verify adjusted treasury units')
        //     })
        // })
        // describe("Withdraw Coin from User that user doesn't have", () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id
        //         const withdrawUnits = 100
        //         await userService
        //             .withdrawCoins(user.userId, withdrawUnits)
        //             .then(() => {
        //                 assert.fail('Function should not complete')
        //             })
        //             .catch((error: any) => {
        //                 expect(error).to.be.instanceOf(InsufficientBalance)
        //                 expect(error.message).to.eq(
        //                     `No input holding - input: 1 portfolio: ${user.portfolioId} holding: coin::fantx`,
        //                 )
        //             })
        //     })
        // })
        // describe("Withdraw Coin from User that user doesn't have", () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id
        //         // put some units in portfolio before withdraw
        //         const portfolioUnits = 1000
        //         await userService.depositCoins(user.userId, portfolioUnits)
        //         const treasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )
        //         const withdrawUnits = 100
        //         await userService.withdrawCoins(user.userId, withdrawUnits)
        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')
        //         const remainingTreasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )
        //         expect(portfolioUnits - madeUnits).to.eq(withdrawUnits, 'verify units withdrawn')
        //         expect(remainingTreasuryUnits - treasuryUnits).to.eq(withdrawUnits, 'verify adjusted treasury units')
        //     })
        // })
    });
});
