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
exports.TreasuryService = void 0;
const luxon_1 = require("luxon");
const _1 = require(".");
const __1 = require("..");
const BANK_PORTFOLIO = 'bank::treasury';
const COIN = 'coin::rkt';
class TreasuryService {
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher || new _1.NullEventPublisher();
        this.userRepository = new __1.UserRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioService = new _1.PortfolioService();
        this.assetHolderService = new __1.AssetHolderService();
        this.transactionService = new _1.TransactionService(this.eventPublisher);
        this.mintService = new _1.MintService();
    }
    depositCoins(userId, units, coinId = COIN) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                const msg = `Cannot deposit to user: ${userId} does not exist`;
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to user: no portfolioId`;
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const sourcePortfolioId = BANK_PORTFOLIO;
            // get current treasury balance to make sure adequate funds
            const balance = yield this.assetHolderService.getAssetHoldingBalance(coinId, sourcePortfolioId);
            if (balance < units) {
                const delta = balance - units;
                this.mintService.mintUnits(coinId, delta);
            }
            const data = {
                inputPortfolioId: sourcePortfolioId,
                outputPortfolioId: portfolioId,
                assetId: coinId,
                units: units,
                tags: {
                    source: 'Deposit',
                },
            };
            yield this.transactionService.executeTransferAsync(data);
            const createdAt = luxon_1.DateTime.utc().toString();
            const deposit = {
                createdAt: createdAt,
                portfolioId: portfolioId,
                assetId: 'currency::usd',
                units: units,
            };
            return this.portfolioService.recordPortfolioDeposit(deposit);
        });
    }
    withdrawCoins(userId, units, coinId = COIN) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                const msg = `Cannot deposit to user: ${userId} does not exist`;
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to user: no portfolioId`;
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const destPortfolioId = BANK_PORTFOLIO;
            // get current user balance to make sure adequate units to redeem
            const balance = yield this.assetHolderService.getAssetHoldingBalance(coinId, portfolioId);
            if (balance < units) {
                units = balance - units;
            }
            const data = {
                inputPortfolioId: portfolioId,
                outputPortfolioId: destPortfolioId,
                assetId: coinId,
                units: units,
                tags: {
                    source: 'Withdraw',
                },
            };
            yield this.transactionService.executeTransferAsync(data);
            const createdAt = luxon_1.DateTime.utc().toString();
            const deposit = {
                createdAt: createdAt,
                portfolioId: portfolioId,
                assetId: 'currency::usd',
                units: -1 * units,
            };
            return this.portfolioService.recordPortfolioDeposit(deposit);
        });
    }
}
exports.TreasuryService = TreasuryService;
