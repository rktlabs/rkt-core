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
/* eslint-env node, mocha */
const chai_1 = require("chai");
const models_1 = require("../../src/models");
const repositories_1 = require("../../src/repositories");
describe('League Repository', () => {
    let leagueRepository;
    const leagueId = 'test1';
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        leagueRepository = new repositories_1.LeagueRepository();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield leagueRepository.deleteAsync(leagueId);
    }));
    describe('Create Basic League', () => {
        it('should create', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            };
            const league = models_1.League.newLeague(data);
            yield leagueRepository.storeAsync(league);
            const readBack = yield leagueRepository.getDetailAsync(leagueId);
            (0, chai_1.expect)(readBack).to.exist;
            (0, chai_1.expect)(readBack.ownerId).to.eq('tester');
            (0, chai_1.expect)(readBack.portfolioId).to.eq(`league::${leagueId}`);
        }));
    });
    describe('Create League with Assets', () => {
        it('should create 1 managedAssets', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            };
            const league = models_1.League.newLeague(data);
            yield leagueRepository.storeAsync(league);
            yield leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            });
            yield leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset2',
                displayName: 'card::asset2',
            });
            const readBack = yield leagueRepository.getDetailAsync(leagueId);
            (0, chai_1.expect)(readBack).to.exist;
            (0, chai_1.expect)(readBack.managedAssets).to.be.instanceOf(Array);
            (0, chai_1.expect)(readBack.managedAssets.length).to.eq(2);
        }));
    });
    describe('Create League with Assets', () => {
        it('should delete managedAsset', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            };
            const league = models_1.League.newLeague(data);
            yield leagueRepository.storeAsync(league);
            yield leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            });
            yield leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset2',
                displayName: 'card::asset2',
            });
            yield leagueRepository.detachLeagueAsset(league.leagueId, 'card::asset1');
            const readBack = yield leagueRepository.getDetailAsync(leagueId);
            (0, chai_1.expect)(readBack).to.exist;
            (0, chai_1.expect)(readBack.managedAssets).to.be.instanceOf(Array);
            (0, chai_1.expect)(readBack.managedAssets.length).to.eq(1);
            (0, chai_1.expect)(readBack.managedAssets[0].assetId).to.eq('card::asset2');
        }));
    });
});
