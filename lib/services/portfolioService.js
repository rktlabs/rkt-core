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
const _1 = require(".");
const __1 = require("..");
class PortfolioService {
    constructor() {
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioActivityRepository = new __1.PortfolioActivityRepository();
        this.assetRepository = new __1.AssetRepository();
        this.makerRepository = new __1.MakerRepository();
        this.leagueRepository = new __1.LeagueRepository();
        this.portfolioDepositRepository = new __1.PortfolioDepositRepository();
        this.portfolioHoldingService = new _1.PortfolioHoldingService();
    }
    // create new portfolio. Fail if it already exists.
    createPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = payload.portfolioId;
            if (portfolioId) {
                const existing = yield this.portfolioRepository.getDetailAsync(portfolioId);
                if (existing) {
                    const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`;
                    throw new __1.DuplicateError(msg, { portfolioId: portfolioId });
                }
            }
            const portfolio = __1.Portfolio.newPortfolio(payload);
            yield this.portfolioRepository.storeAsync(portfolio);
            return portfolio;
        });
    }
    updatePortfolio(portfolioId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioRepository.updateAsync(portfolioId, payload);
        });
    }
    deletePortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked assets
            let assetIds = yield this.assetRepository.isPortfolioUsed(portfolioId);
            if (assetIds) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetIds}`);
            }
            let makerIds = yield this.makerRepository.isPortfolioUsed(portfolioId);
            if (makerIds) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Maker Portfolio in use: ${makerIds}`);
            }
            let leagueIds = yield this.leagueRepository.isPortfolioUsed(portfolioId);
            if (leagueIds) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Portfolio linked to league: ${leagueIds}`);
            }
            yield this.scrubPortfolio(portfolioId);
        });
    }
    scrubPortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.portfolioHoldingService.scrubPortfolioHoldings(portfolioId);
            yield this.portfolioActivityRepository.scrubCollectionAsync(portfolioId);
            yield this.portfolioDepositRepository.scrubAsync(portfolioId);
            yield this.portfolioRepository.deleteAsync(portfolioId);
        });
    }
    submitPortfolioDeposit(deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = deposit.portfolioId;
            yield this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit);
            const deposits = yield this.computePortfolioNetDeposits(portfolioId);
            this.updatePortfolio(portfolioId, { deposits: deposits });
        });
    }
    computePortfolioNetDeposits(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deposits = yield this.portfolioDepositRepository.getPortfolioDeposits(portfolioId);
            const total = deposits.reduce((acc, deposit) => {
                return acc + deposit.units;
            }, 0);
            return total;
        });
    }
    // ensure that portfolio is created. crate new portfolio if don't exist
    // leave in place anything already there.
    // (used by bootstrapper)
    createOrKeepPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload || !payload.portfolioId) {
                throw new Error('Portfolio Creation Failed - no portfolioId');
            }
            const promises = [];
            const portfolioId = payload.portfolioId;
            const existing = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!existing) {
                const portfolio = __1.Portfolio.newPortfolio(payload);
                promises.push(this.portfolioRepository.storeAsync(portfolio));
            }
            return Promise.all(promises);
        });
    }
}
exports.PortfolioService = PortfolioService;
