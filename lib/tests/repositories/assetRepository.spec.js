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
describe('Asset Repository', () => {
    let assetRepository;
    const testAssetId = 'card::test1';
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        assetRepository = new repositories_1.AssetRepository();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // clean out records.
        yield assetRepository.deleteAsync(testAssetId);
    }));
    describe('Create Basic Asset', () => {
        it('should create and read back', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            const asset = models_1.Asset.newAsset(data);
            yield assetRepository.storeAsync(asset);
            const readBack = yield assetRepository.getDetailAsync(testAssetId);
            (0, chai_1.expect)(readBack).to.exist;
            if (readBack) {
                (0, chai_1.expect)(readBack.type).to.eq('card');
                (0, chai_1.expect)(readBack.ownerId).to.eq('tester');
                (0, chai_1.expect)(readBack.assetId).to.eq(testAssetId);
                (0, chai_1.expect)(readBack.displayName).to.eq('display-me');
                (0, chai_1.expect)(readBack.leagueId).to.eq('theLeagueId');
                (0, chai_1.expect)(readBack.leagueDisplayName).to.eq('theLeagueDisplayName');
            }
        }));
    });
    describe('Delete Asset', () => {
        it('should create and delete', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            const asset = models_1.Asset.newAsset(data);
            yield assetRepository.storeAsync(asset);
            yield assetRepository.deleteAsync(testAssetId);
            const readBack = yield assetRepository.getDetailAsync(testAssetId);
            (0, chai_1.expect)(readBack).to.not.exist;
        }));
    });
    describe('Create Full Asset', () => {
        it('should create and read back', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
            };
            const asset = models_1.Asset.newAsset(data);
            yield assetRepository.storeAsync(asset);
            const readBack = yield assetRepository.getDetailAsync(testAssetId);
            (0, chai_1.expect)(readBack).to.exist;
            if (readBack) {
                (0, chai_1.expect)(readBack).to.have.property('tags');
                (0, chai_1.expect)(readBack.tags).to.have.property('tag1');
            }
        }));
    });
    describe.skip('Get Assets', () => {
        it('should read list', () => __awaiter(void 0, void 0, void 0, function* () {
            const assetList = yield assetRepository.getListAsync({ pageSize: 2 });
            (0, chai_1.expect)(assetList).to.exist;
            (0, chai_1.expect)(assetList.length).to.eq(2);
        }));
    });
    describe('Get FilteredAssets', () => {
        it('should read filterred list', () => __awaiter(void 0, void 0, void 0, function* () {
            const assetList = yield assetRepository.getListAsync({ pageSize: 2, type: 'coin' });
            (0, chai_1.expect)(assetList).to.exist;
            (0, chai_1.expect)(assetList.length).to.eq(1);
        }));
    });
});
