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
const log4js = require("log4js");
const luxon_1 = require("luxon");
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger('TreasuryService');
const BANK_PORTFOLIO = 'bank::treasury';
const COIN = 'coin::rkt';
class TreasuryService {
    //private me: Principal
    constructor(assetRepository, portfolioRepository, transactionRepository, userRepository) {
        //this.me = me
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.portfolioFactory = new __1.PortfolioFactory(portfolioRepository);
        this.assetHolderService = new _1.AssetHolderService(assetRepository);
        this.transactionService = new _1.TransactionService(assetRepository, portfolioRepository, transactionRepository);
        this.mintService = new _1.MintService(assetRepository, portfolioRepository, transactionRepository);
    }
    mintUnits(units) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = COIN;
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Cannot deposit to asset: ${assetId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { assetId: assetId });
            }
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Cannot deposit to asset: ${assetId} portfolio does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { assetId: assetId });
            }
            // get current treasury balance to make sure adequate funds
            const balance = yield this.assetHolderService.getAssetHolderBalance(assetId, assetPortfolioId);
            if (balance < units) {
                const delta = units - balance;
                yield this.mintService.mintUnits(COIN, delta);
            }
            const portfolioId = BANK_PORTFOLIO;
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const data = {
                inputPortfolioId: assetPortfolioId,
                outputPortfolioId: portfolioId,
                assetId: assetId,
                units: units,
                tags: {
                    source: 'TreasuryDeposit',
                },
            };
            yield this.transactionService.executeTransferAsync(data);
        });
    }
    depositCoins(userId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                const msg = `Cannot deposit to user: ${userId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to user: no portfolioId`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const sourcePortfolioId = BANK_PORTFOLIO;
            const assetId = COIN;
            // get current treasury balance to make sure adequate funds
            const balance = yield this.assetHolderService.getAssetHolderBalance(assetId, sourcePortfolioId);
            if (balance < units) {
                const delta = units - balance;
                yield this.mintUnits(delta);
            }
            const data = {
                inputPortfolioId: sourcePortfolioId,
                outputPortfolioId: portfolioId,
                assetId: assetId,
                units: units,
                tags: {
                    source: 'UserDeposit',
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
            return yield this.portfolioFactory.recordPortfolioDeposit(deposit);
        });
    }
    withdrawCoins(userId, units, coinId = COIN) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                const msg = `Cannot deposit to user: ${userId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to user: no portfolioId`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { userId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                logger.error(msg);
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const destPortfolioId = BANK_PORTFOLIO;
            // get current user balance to make sure adequate units to redeem
            const balance = yield this.assetHolderService.getAssetHolderBalance(coinId, portfolioId);
            if (balance < units) {
                units = balance - units;
            }
            const data = {
                inputPortfolioId: portfolioId,
                outputPortfolioId: destPortfolioId,
                assetId: coinId,
                units: units,
                tags: {
                    source: 'UserWithdraw',
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
            return this.portfolioFactory.recordPortfolioDeposit(deposit);
        });
    }
}
exports.TreasuryService = TreasuryService;
