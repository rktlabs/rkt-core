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
exports.PortfolioService = void 0;
const __1 = require("..");
const log4js = require("log4js");
const logger = log4js.getLogger();
class PortfolioService {
    constructor(portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
        this.portfolioDepositRepository = new __1.PortfolioDepositRepository();
    }
    // create new portfolio. Fail if it already exists.
    createPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = payload.portfolioId;
            if (portfolioId) {
                const existing = yield this.portfolioRepository.getDetailAsync(portfolioId);
                if (existing) {
                    const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`;
                    logger.error(msg);
                    throw new __1.DuplicateError(msg, { portfolioId: portfolioId });
                }
            }
            const portfolio = yield this.createUserImpl(payload);
            logger.info(`created portfolio: ${portfolio.portfolioId}`);
            return portfolio;
        });
    }
    // ensure that portfolio is created. crate new portfolio if don't exist
    // leave in place anything already there.
    // (used by bootstrapper)
    createOrKeepPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload || !payload.portfolioId) {
                const msg = 'Portfolio Creation Failed - no portfolioId';
                logger.error(msg);
                throw new Error(msg);
            }
            const portfolioId = payload.portfolioId;
            let portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                portfolio = yield this.createUserImpl(payload);
                logger.info(`created portfolio: ${portfolio.portfolioId}`);
            }
            return portfolio;
        });
    }
    updatePortfolio(portfolioId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`update portfolio: ${portfolioId}`);
            return yield this.portfolioRepository.updateAsync(portfolioId, payload);
        });
    }
    deletePortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete portfolio: ${portfolioId}`);
            const assetRepository = new __1.AssetRepository();
            const marketMakerRepository = new __1.MarketMakerRepository();
            const leagueRepository = new __1.LeagueRepository();
            const userRepository = new __1.UserRepository();
            // check for linked assets
            let assetIds = yield assetRepository.isPortfolioUsed(portfolioId);
            if (assetIds) {
                const msg = `Cannot Delete Portfolio. Asset Portfolio in use: ${assetIds}`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            let marketMakerIds = yield marketMakerRepository.isPortfolioUsed(portfolioId);
            if (marketMakerIds) {
                const msg = `Cannot Delete Portfolio. MarketMaker Portfolio in use: ${marketMakerIds}`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            let leagueIds = yield leagueRepository.isPortfolioUsed(portfolioId);
            if (leagueIds) {
                const msg = `Cannot Delete Portfolio. Portfolio linked to league: ${leagueIds}`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            let userIds = yield userRepository.isPortfolioUsed(portfolioId);
            if (userIds) {
                const msg = `Cannot Delete Portfolio. Portfolio linked to user: ${userIds}`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            yield this.scrubPortfolio(portfolioId);
        });
    }
    scrubPortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioActivityRepository = new __1.PortfolioActivityRepository();
            const assetRepository = new __1.AssetRepository();
            const assetHolderService = new __1.AssetHolderService(assetRepository);
            yield assetHolderService.scrubPortfolioHoldings(portfolioId);
            yield portfolioActivityRepository.scrubCollectionAsync(portfolioId);
            yield this.portfolioDepositRepository.scrubAsync(portfolioId);
            yield this.portfolioRepository.deleteAsync(portfolioId);
        });
    }
    recordPortfolioDeposit(deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`recordPortfolioDeposit: ${deposit.portfolioId}`);
            const portfolioId = deposit.portfolioId;
            yield this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit);
            const deposits = yield this.computePortfolioNetDeposits(portfolioId);
            this.updatePortfolio(portfolioId, { deposits: deposits });
        });
    }
    computePortfolioNetDeposits(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`computePortfolioNetDeposits: ${portfolioId}`);
            const deposits = yield this.portfolioDepositRepository.getPortfolioDeposits(portfolioId);
            const total = deposits.reduce((acc, deposit) => {
                return acc + deposit.units;
            }, 0);
            return total;
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    createUserImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolio = __1.Portfolio.newPortfolio(payload);
            yield this.portfolioRepository.storeAsync(portfolio);
            return portfolio;
        });
    }
}
exports.PortfolioService = PortfolioService;
