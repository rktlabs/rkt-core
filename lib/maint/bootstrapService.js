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
exports.BootstrapService = void 0;
const log4js = require("log4js");
const __1 = require("..");
const logger = log4js.getLogger('bootstrapper');
class BootstrapService {
    constructor(assetRepository, portfolioRepository, transactionRepository, userRepository, marketMakerRepository, leagueRepository) {
        this.userService = new __1.UserFactory(portfolioRepository, userRepository);
        this.marketMakerService = new __1.MarketMakerFactory(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
        this.assetService = new __1.AssetFactory(assetRepository, portfolioRepository, marketMakerRepository, transactionRepository);
        this.portfolioService = new __1.PortfolioFactory(portfolioRepository);
        this.leagueService = new __1.LeagueFactory(leagueRepository, assetRepository, portfolioRepository, marketMakerRepository, transactionRepository);
    }
    bootRkt() {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = 'coin::rkt';
            yield this.assetService.scrubAsset(assetId);
            const assetDef = {
                ownerId: 'test',
                symbol: assetId,
                displayName: assetId,
            };
            yield this.assetService.createAsset(assetDef);
        });
    }
    bootBank() {
        return __awaiter(this, void 0, void 0, function* () {
            const treasuryId = 'bank::treasury';
            const mintId = 'bank::mint';
            yield this.portfolioService.scrubPortfolio(treasuryId);
            yield this.portfolioService.createOrKeepPortfolio({
                type: 'bank',
                ownerId: 'test',
                portfolioId: treasuryId,
            });
            yield this.portfolioService.scrubPortfolio(mintId);
            yield this.portfolioService.createOrKeepPortfolio({
                type: 'bank',
                ownerId: 'test',
                portfolioId: mintId,
            });
        });
    }
    bootLeague() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueService.scrubLeague('test');
            yield this.leagueService.createLeague({
                ownerId: 'test',
                leagueId: 'test',
                tags: {
                    test: true,
                },
            });
        });
    }
    bootUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = 'testbot';
            yield this.userService.scrubUser(userId);
            yield this.userService.createUser({
                userId: userId,
                dob: '1963-05-07',
                email: 'testbot@hedbot.com',
                name: 'EJ Testbot',
                username: 'testbot',
                displayName: 'TestBot',
                tags: {
                    test: true,
                },
            });
        });
    }
    bootAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leagueId = 'test';
            yield this.assetService.scrubAsset(assetId);
            yield this.assetService.createAsset({
                ownerId: 'test',
                symbol: assetId,
                displayName: assetId,
                leagueId: leagueId,
                leagueDisplayName: leagueId,
                tags: {
                    test: true,
                },
            });
            yield this.leagueService.attachAsset(leagueId, { assetId: assetId, displayName: assetId });
            const makerConfig = {
                type: 'bondingCurveAMM',
                ownerId: 'test',
                assetId: assetId,
                settings: {
                    initMadeUnits: 0,
                    initPrice: 1,
                    tags: {
                        test: true,
                    },
                },
            };
            yield this.marketMakerService.createMarketMaker(makerConfig, false);
        });
    }
    bootAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootAsset('card::testehed');
            yield this.bootAsset('card::testjhed');
        });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.bootRkt(), this.bootBank(), this.bootUser(), this.bootLeague()]);
            yield Promise.all([this.bootAssets()]);
        });
    }
}
exports.BootstrapService = BootstrapService;
