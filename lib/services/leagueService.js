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
exports.LeagueService = void 0;
const _1 = require(".");
const __1 = require("..");
class LeagueService {
    constructor() {
        this.assetRepository = new __1.AssetRepository();
        this.leagueRepository = new __1.LeagueRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioService = new _1.PortfolioService();
        this.assetService = new _1.AssetService();
    }
    createLeague(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const leagueId = payload.leagueId;
            if (leagueId) {
                // check for existing league with that Id. If exists, then fail out.
                const league = yield this.leagueRepository.getDetailAsync(leagueId);
                if (league) {
                    const msg = `League Creation Failed - leagueId: ${leagueId} already exists`;
                    throw new __1.DuplicateError(msg, { leagueId });
                }
                // check for existence of league portfolio (shouldn't exist if league doesn't exist)
                const portfolioId = `league::${leagueId}`;
                const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                if (portfolio) {
                    const msg = `League Creation Failed - League portfolioId: ${portfolioId} already exists`;
                    throw new __1.ConflictError(msg, { portfolioId });
                }
            }
            const league = yield this.createLeagueImpl(payload);
            return league;
        });
    }
    deleteLeague(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            let ids = this.assetRepository.isLeagueUsed(leagueId);
            if (ids) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${ids}`);
            }
            const league = yield this.leagueRepository.getDetailAsync(leagueId);
            if (league) {
                const portfolioId = league.portfolioId;
                yield this.leagueRepository.deleteAsync(leagueId);
                yield this.portfolioService.deletePortfolio(portfolioId);
            }
        });
    }
    scrubLeague(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub all of the owned assets
            const managedAssetIds = yield this.assetRepository.getLeagueAssetsAsync(leagueId);
            const promises = [];
            managedAssetIds.forEach((asset) => {
                promises.push(this.scrubLeagueAsset(leagueId, asset.assetId));
            });
            // scrub the associated portfolio
            const portfolioId = `league::${leagueId}`;
            promises.push(this.portfolioService.scrubPortfolio(portfolioId));
            // scrub the contraact
            promises.push(this.leagueRepository.deleteAsync(leagueId));
            yield Promise.all(promises);
        });
    }
    scrubLeagueAsset(leagueId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            promises.push(this.assetService.scrubAsset(assetId));
            promises.push(this.detachAsset(leagueId, assetId));
            return Promise.all(promises);
        });
    }
    createAsset(leagueSpec, assetDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this.createAssetImpl(league, assetDef);
        });
    }
    attachAsset(leagueSpec, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this.attachAssetToLeague(league, asset);
        });
    }
    detachAsset(leagueSpec, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this.detachAssetFromLeague(league, assetId);
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    createLeagueImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = __1.League.newLeague(payload);
            const portfolioId = yield this.createLeaguePortfolioImpl(league);
            league.portfolioId = portfolioId;
            yield this.leagueRepository.storeAsync(league);
            return league;
        });
    }
    attachAssetToLeague(league, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueRepository.attachLeagueAsset(league.leagueId, asset);
        });
    }
    detachAssetFromLeague(league, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueRepository.detachLeagueAsset(league.leagueId, assetId);
        });
    }
    createLeaguePortfolioImpl(league) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = `${league.displayName} value portfolio`;
            const leaguePortfolioDef = {
                type: 'league',
                portfolioId: `league::${league.leagueId}`,
                ownerId: league.ownerId,
                displayName: displayName,
            };
            const portfolio = yield this.portfolioService.createPortfolio(leaguePortfolioDef);
            return portfolio.portfolioId;
        });
    }
    createAssetImpl(league, assetDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = assetDef.displayName;
            const assetSymbol = `${assetDef.symbol}`;
            const assetConfig = {
                ownerId: league.ownerId,
                symbol: assetSymbol,
                displayName: displayName,
                leagueId: league.leagueId,
                leagueDisplayName: league.displayName,
            };
            try {
                const asset = yield this.assetService.createAsset(assetConfig);
                console.log(`new asset: ${asset.assetId} `);
                yield this.attachAssetToLeague(league, asset);
            }
            catch (err) {
                console.log(`create asset error: ${assetConfig.symbol} - ${err}`);
            }
        });
    }
}
exports.LeagueService = LeagueService;
