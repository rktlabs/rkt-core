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
const src_1 = require("../../src");
describe('Asset Repository', () => {
    let assetRepository;
    let assetQuery;
    const testAssetId = 'card::test1';
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        assetRepository = new src_1.AssetRepository();
        assetQuery = new src_1.AssetQuery();
    }));
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
            const asset = src_1.Asset.newAsset(data);
            yield assetRepository.storeAsync(asset);
            const readBack = yield assetQuery.getDetailAsync(testAssetId);
            (0, chai_1.expect)(readBack).to.exist;
            if (readBack) {
                (0, chai_1.expect)(readBack).to.have.property('tags');
                (0, chai_1.expect)(readBack.tags).to.have.property('tag1');
            }
        }));
    });
});
