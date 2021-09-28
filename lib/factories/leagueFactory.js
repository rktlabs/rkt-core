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
exports.LeagueFactory = void 0;
const log4js = require("log4js");
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger('LeagueFactory');
class LeagueFactory {
    constructor(leagueRepository, assetRepository, portfolioRepository) {
        this.assetRepository = assetRepository;
        this.leagueRepository = leagueRepository;
        this.portfolioRepository = portfolioRepository;
        this.portfolioFactory = new _1.PortfolioFactory(portfolioRepository);
        this.assetFactory = new _1.AssetFactory(assetRepository, portfolioRepository);
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
            const league = yield this._createLeagueImpl(payload);
            return league;
        });
    }
    deleteLeague(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            let ids = yield this.assetRepository.isLeagueUsed(leagueId);
            if (ids) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${ids}`);
            }
            const league = yield this.leagueRepository.getDetailAsync(leagueId);
            if (league) {
                const portfolioId = league.portfolioId;
                yield this.leagueRepository.deleteAsync(leagueId);
                yield this.portfolioFactory.deletePortfolio(portfolioId);
            }
        });
    }
    createAsset(leagueSpec, assetDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this._createAssetImpl(league, assetDef);
        });
    }
    attachAsset(leagueSpec, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this._attachAssetToLeague(league, asset);
        });
    }
    detachAsset(leagueSpec, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = typeof leagueSpec === 'string' ? yield this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec;
            if (!league) {
                throw new Error(`League Not Found: ${leagueSpec}`);
            }
            yield this._detachAssetFromLeague(league, assetId);
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _createLeagueImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = __1.League.newLeague(payload);
            const portfolioId = yield this._createLeaguePortfolioImpl(league);
            league.portfolioId = portfolioId;
            yield this.leagueRepository.storeAsync(league);
            return league;
        });
    }
    _attachAssetToLeague(league, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueRepository.attachLeagueAsset(league.leagueId, asset);
        });
    }
    _detachAssetFromLeague(league, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueRepository.detachLeagueAsset(league.leagueId, assetId);
        });
    }
    _createLeaguePortfolioImpl(league) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = `${league.displayName} value portfolio`;
            const leaguePortfolioDef = {
                type: 'league',
                portfolioId: `league::${league.leagueId}`,
                ownerId: league.ownerId,
                displayName: displayName,
            };
            const portfolio = yield this.portfolioFactory.createPortfolio(leaguePortfolioDef);
            return portfolio.portfolioId;
        });
    }
    _createAssetImpl(league, assetDef) {
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
                const asset = yield this.assetFactory.createAsset(assetConfig);
                logger.info(`new asset: ${asset.assetId} `);
                yield this._attachAssetToLeague(league, asset);
            }
            catch (err) {
                logger.error(`create asset error: ${assetConfig.symbol} - ${err}`);
            }
        });
    }
}
exports.LeagueFactory = LeagueFactory;
