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
exports.UserFactory = void 0;
const __1 = require("..");
const log4js = require("log4js");
const logger = log4js.getLogger('UserFactory');
const TREASURY_PORTFOLIO = 'bank::treasury';
class UserFactory {
    constructor(portfolioRepository, userRepository) {
        this.userRepository = userRepository;
        this.portfolioRepository = portfolioRepository;
        this.portfolioFactory = new __1.PortfolioFactory(portfolioRepository);
    }
    createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = payload.userId;
            if (userId) {
                const existing = yield this.userRepository.getDetailAsync(userId);
                if (existing) {
                    const msg = `Portfolio Creation Failed - userId: ${userId} already exists`;
                    logger.error(msg);
                    throw new __1.DuplicateError(msg, { userId: userId });
                }
            }
            const username = payload.username;
            if (username) {
                const existingUser = yield this.userRepository.lookupUserByUserNameAsync(username);
                if (existingUser) {
                    const msg = `User Creation Failed - username: ${username} already exists`;
                    logger.error(msg);
                    throw new __1.DuplicateError(msg, { username });
                }
            }
            const email = payload.email;
            if (email) {
                const existingUser = yield this.userRepository.lookupUserByEmailAsync(email);
                if (existingUser) {
                    const msg = `User Creation Failed - email: ${email} already exists`;
                    logger.error(msg);
                    throw new __1.DuplicateError(msg, { email });
                }
            }
            if (payload.initialCoins) {
                // check for existence of registry
                const treasuryPortfolioId = TREASURY_PORTFOLIO;
                const treasuryPortfolio = yield this.portfolioRepository.getDetailAsync(treasuryPortfolioId);
                if (!treasuryPortfolio) {
                    const msg = `MarketMaker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`;
                    logger.error(msg);
                    throw new __1.ConflictError(msg, { portfolioId: treasuryPortfolioId });
                }
            }
            const user = yield this._createUserImpl(payload);
            logger.trace(`created user: ${user.userId}`);
            return user;
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`deleteUser: ${userId}`);
            yield this.userRepository.deleteAsync(userId);
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _createUserImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = __1.User.newUser(payload);
            const portfolioId = yield this._createUserPortfolioImpl(user);
            user.portfolioId = portfolioId;
            yield this.userRepository.storeAsync(user);
            return user;
        });
    }
    _createUserPortfolioImpl(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPortfolioDef = {
                type: 'user',
                portfolioId: `user::${user.userId}`,
                ownerId: user.userId,
            };
            const portfolio = yield this.portfolioFactory.createPortfolio(userPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.UserFactory = UserFactory;
