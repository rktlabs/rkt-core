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
const models_1 = require("../../../src/models");
describe('Asset', () => {
    const assetId = 'card::the.card';
    describe('Create New Asset', () => {
        it('new asset should have no portfolioId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            };
            const asset = models_1.Asset.newAsset(data);
            (0, chai_1.expect)(asset.portfolioId).to.not.exist;
        }));
        it('no displayname should default to assetId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            };
            const asset = models_1.Asset.newAsset(data);
            (0, chai_1.expect)(asset.displayName).to.eq(assetId);
            (0, chai_1.expect)(asset.portfolioId).to.not.exist;
        }));
        it('no leagueDisplayName should default to contrctId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            };
            const asset = models_1.Asset.newAsset(data);
            (0, chai_1.expect)(asset.leagueDisplayName).to.eq('theLeagueId');
        }));
        it('use displayName if supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const displayName = 'thisisme';
            const data = {
                symbol: assetId,
                ownerId: 'tester',
                displayName: 'thisisme',
                leagueId: 'theLeagueId',
            };
            const asset = models_1.Asset.newAsset(data);
            (0, chai_1.expect)(asset.displayName).to.eq(displayName);
        }));
        it('use leagueDisplayName if supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            const asset = models_1.Asset.newAsset(data);
            (0, chai_1.expect)(asset.leagueDisplayName).to.eq('theLeagueDisplayName');
        }));
    });
});
