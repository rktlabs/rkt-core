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
exports.UserService = void 0;
const _1 = require(".");
const __1 = require("..");
const BANK_PORTFOLIO = 'bank::treasury';
const COIN = 'coin::fantx';
class UserService {
    // private transactionService: TransactionService
    constructor() {
        this.userRepository = new __1.UserRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioService = new _1.PortfolioService();
        // this.transactionService = new TransactionService(this.eventPublisher)
    }
    newUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = payload.userId;
            if (userId) {
                const existing = yield this.userRepository.getDetailAsync(userId);
                if (existing) {
                    const msg = `Portfolio Creation Failed - userId: ${userId} already exists`;
                    throw new __1.DuplicateError(msg, { userId: userId });
                }
            }
            const username = payload.username;
            if (username) {
                const existingUser = yield this.userRepository.lookupUserByUserNameAsync(username);
                if (existingUser) {
                    const msg = `User Creation Failed - username: ${username} already exists`;
                    throw new __1.DuplicateError(msg, { username });
                }
            }
            const email = payload.email;
            if (email) {
                const existingUser = yield this.userRepository.lookupUserByEmailAsync(email);
                if (existingUser) {
                    const msg = `User Creation Failed - email: ${email} already exists`;
                    throw new __1.DuplicateError(msg, { email });
                }
            }
            if (payload.initialCoins) {
                // check for existence of registry
                const treasuryPortfolioId = BANK_PORTFOLIO;
                const treasuryPortfolio = yield this.portfolioRepository.getDetailAsync(treasuryPortfolioId);
                if (!treasuryPortfolio) {
                    const msg = `Maker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`;
                    throw new __1.ConflictError(msg, { portfolioId: treasuryPortfolioId });
                }
            }
            const user = yield this.createUserImpl(payload);
            // if (payload.initialCoins) {
            //     await this.depositCoins(user.userId, payload.initialCoins)
            // }
            return user;
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (user) {
                const portfolioId = user.portfolioId;
                yield this.userRepository.deleteAsync(userId);
                if (portfolioId) {
                    yield this.portfolioService.deletePortfolio(portfolioId);
                }
            }
        });
    }
    scrubUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.portfolioService.scrubPortfolio(`user::${userId}`);
            yield this.userRepository.deleteAsync(userId);
        });
    }
    // async depositCoins(userId: string, units: number, coinId = COIN) {
    //     const user = await this.userRepository.getDetailAsync(userId)
    //     if (!user) {
    //         const msg = `Cannot deposit to user: ${userId} does not exist`
    //         throw new NotFoundError(msg, { userId })
    //     }
    //     const portfolioId = user.portfolioId
    //     if (!portfolioId) {
    //         const msg = `Cannot deposit to user: no portfolioId`
    //         throw new NotFoundError(msg, { userId })
    //     }
    //     const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
    //     if (!portfolio) {
    //         const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
    //         throw new NotFoundError(msg, { portfolioId })
    //     }
    //     const sourcePortfolioId = BANK_PORTFOLIO
    //     const data: TTransfer = {
    //         inputPortfolioId: sourcePortfolioId,
    //         outputPortfolioId: portfolioId,
    //         assetId: coinId,
    //         units: units,
    //         tags: {
    //             source: 'Deposit',
    //         },
    //     }
    //     await this.transactionService.newTransferAsync(data)
    //     const createdAt = DateTime.utc().toString()
    //     const deposit: TPortfolioDeposit = {
    //         createdAt: createdAt,
    //         portfolioId: portfolioId,
    //         assetId: 'currency::usd',
    //         units: units,
    //     }
    //     return this.portfolioService.submitPortfolioDeposit(deposit)
    // }
    // async withdrawCoins(userId: string, units: number, coinId = COIN) {
    //     const user = await this.userRepository.getUser(userId)
    //     if (!user) {
    //         const msg = `Cannot deposit to user: ${userId} does not exist`
    //         throw new NotFoundError(msg, { userId })
    //     }
    //     const portfolioId = user.portfolioId
    //     if (!portfolioId) {
    //         const msg = `Cannot deposit to user: no portfolioId`
    //         throw new NotFoundError(msg, { userId })
    //     }
    //     const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
    //     if (!portfolio) {
    //         const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
    //         throw new NotFoundError(msg, { portfolioId })
    //     }
    //     const sourcePortfolioId = BANK_PORTFOLIO
    //     const data: TTransfer = {
    //         inputPortfolioId: portfolioId,
    //         outputPortfolioId: sourcePortfolioId,
    //         assetId: coinId,
    //         units: units,
    //         tags: {
    //             source: 'Withdraw',
    //         },
    //     }
    //     await this.transactionService.newTransferAsync(data)
    //     const createdAt = DateTime.utc().toString()
    //     const deposit: TPortfolioDeposit = {
    //         createdAt: createdAt,
    //         portfolioId: portfolioId,
    //         assetId: 'currency::usd',
    //         units: -1 * units,
    //     }
    //     return this.portfolioService.submitPortfolioDeposit(deposit)
    // }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    createUserImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = __1.User.newUser(payload);
            const portfolioId = yield this.createUserPortfolioImpl(user);
            user.portfolioId = portfolioId;
            yield this.userRepository.storeAsync(user);
            return user;
        });
    }
    createUserPortfolioImpl(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPortfolioDef = {
                type: 'user',
                portfolioId: `user::${user.userId}`,
                ownerId: user.userId,
            };
            const portfolio = yield this.portfolioService.newPortfolio(userPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.UserService = UserService;
