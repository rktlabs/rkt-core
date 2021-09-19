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
const __1 = require("..");
class BootstrapService {
    constructor() {
        this.userService = new __1.UserService();
        this.makerService = new __1.MakerService();
        this.assetService = new __1.AssetService();
        this.portfolioService = new __1.PortfolioService();
        this.leagueService = new __1.LeagueService();
    }
    // bootstrap the system with the "rkt" coin
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
            yield this.portfolioService.scrubPortfolio(mintId);
            yield this.portfolioService.createOrKeepPortfolio({
                type: 'bank',
                ownerId: 'test',
                portfolioId: treasuryId,
            });
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
            });
        });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.bootRkt(), this.bootBank(), this.bootLeague(), this.bootUser()]);
        });
    }
    bootAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bootAsset('card::jbone');
            this.bootAsset('card::mhed');
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
            });
            yield this.leagueService.attachAsset(leagueId, { assetId: assetId, displayName: assetId });
            const makerConfig = {
                type: 'bondingmaker1',
                ownerId: 'test',
                assetId: assetId,
                settings: {
                    initMadeUnits: 0,
                    initPrice: 1,
                },
            };
            yield this.makerService.createMaker(makerConfig, false);
        });
    }
    // async setupTreasury() {
    //     let portfolio = await this.portfolioRepository.getDetailAsync('bank::treasury')
    //     if (!portfolio) {
    //         await this.portfolioService.createOrKeepPortfolio({
    //             type: 'bank',
    //             ownerId: 'test',
    //             portfolioId: 'bank::treasury',
    //         })
    //     }
    //     await this.transactionService.mintCoinsToPortfolio('bank::treasury', 1000000)
    // }
    fullBoot() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootstrap();
            yield Promise.all([this.bootAssets()]);
        });
    }
    fullScrub() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.leagueService.scrubLeague('test'), // scrubs coin too
            ]);
            yield Promise.all([
                this.portfolioService.scrubPortfolio('bank::treasury'),
                this.portfolioService.scrubPortfolio('bank::mint'), // scrubs coin too
            ]);
            yield Promise.all([this.userService.scrubUser('hedbot')]);
            yield Promise.all([
                this.assetService.scrubAsset('coin::rkt'), // scrubs coin too
            ]);
        });
    }
}
exports.BootstrapService = BootstrapService;
