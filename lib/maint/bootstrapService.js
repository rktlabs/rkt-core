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
        this.eventPublisher = new __1.NullEventPublisher();
        this.assetRepository = new __1.AssetRepository();
        this.userService = new __1.UserService();
        //this.portfolioRepository = new PortfolioRepository()
        this.assetService = new __1.AssetService();
        this.portfolioService = new __1.PortfolioService();
        this.assetHolderService = new __1.AssetHolderService();
        this.leagueService = new __1.LeagueService();
        //this.transactionService = new TransactionService(this.eventPublisher)
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
    bootTestAsset() {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = 'card::jbone';
            this.assetService.scrubAsset(assetId);
            const leagueId = 'test';
            let asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                yield this.leagueService.createAsset(leagueId, {
                    symbol: assetId,
                    displayName: assetId,
                });
            }
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
            yield Promise.all([this.bootTestAsset(), this.bootUser()]);
        });
    }
    fullScrub() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.leagueService.scrubLeague('test'),
                this.assetService.scrubAsset('coin::rkt'), // scrubs coin too
            ]);
            yield Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')]);
        });
    }
    clearHoldings() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset holders first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.assetHolderService.scrubAssetHolders('coin::rkt'),
                this.assetHolderService.scrubAssetHolders('card::jbone::test'),
            ]);
            yield Promise.all([
                this.assetHolderService.scrubPortfolioHoldings('user::hedbot'),
                this.assetHolderService.scrubPortfolioHoldings('league::test'),
            ]);
        });
    }
}
exports.BootstrapService = BootstrapService;
