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
const src_1 = require("../../../src");
describe('MarketMakerService', () => {
    describe('persist market maker', function () {
        this.timeout(10000);
        let bootstrapper;
        let assetService;
        let marketMakerService;
        let marketMakerRepository;
        const assetId = 'card::testehed';
        let marketMaker;
        before(() => __awaiter(this, void 0, void 0, function* () {
            bootstrapper = new src_1.BootstrapService();
            assetService = new src_1.AssetService();
            marketMakerService = new src_1.MarketMakerService();
            marketMakerRepository = new src_1.MarketMakerRepository();
            yield bootstrapper.bootstrap();
            yield assetService.scrubAsset(assetId);
            const assetConfig = {
                ownerId: 'test',
                symbol: assetId,
                displayName: assetId,
                tags: {
                    test: true,
                },
            };
            yield assetService.createAsset(assetConfig);
        }));
        describe('buy', () => {
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield marketMakerService.scrubMarketMaker(assetId);
                const makerConfig = {
                    type: 'bondingCurveAMM',
                    ownerId: 'test',
                    assetId: assetId,
                    tags: {
                        test: true,
                    },
                    settings: {
                        initialUnits: 0,
                        initialValue: 0,
                        initialPrice: 1,
                        e: 1,
                        m: 1,
                    },
                };
                marketMaker = yield marketMakerService.createMarketMaker(makerConfig, false);
                (0, chai_1.expect)(marketMaker).to.exist;
            }));
            describe('Create Basic MarketMaker', () => __awaiter(this, void 0, void 0, function* () {
                it('should create', () => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const order = src_1.MarketMakerService.generateOrder({
                        assetId: assetId,
                        orderId: 'order1',
                        portfolioId: `asset::${assetId}`,
                        orderSide: 'bid',
                        orderSize: 4,
                    });
                    yield marketMaker.processOrder(order);
                    const readBack = yield marketMakerRepository.getDetailAsync(assetId);
                    if (readBack) {
                        (0, chai_1.expect)((_b = (_a = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _a === void 0 ? void 0 : _a.last) === null || _b === void 0 ? void 0 : _b.side).eq('bid');
                        (0, chai_1.expect)((_d = (_c = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _c === void 0 ? void 0 : _c.last) === null || _d === void 0 ? void 0 : _d.units).eq(4);
                        (0, chai_1.expect)((_f = (_e = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _e === void 0 ? void 0 : _e.last) === null || _f === void 0 ? void 0 : _f.value).eq(12);
                        (0, chai_1.expect)((_h = (_g = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _g === void 0 ? void 0 : _g.last) === null || _h === void 0 ? void 0 : _h.unitValue).eq(3);
                        (0, chai_1.expect)(readBack.params.madeUnits).eq(4);
                        (0, chai_1.expect)(readBack.params.cumulativeValue).eq(12);
                    }
                    else {
                        chai_1.expect.fail('nothing read back');
                    }
                }));
            }));
        });
        describe('buy', () => {
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield marketMakerService.scrubMarketMaker(assetId);
                const makerConfig = {
                    type: 'bondingCurveAMM',
                    ownerId: 'test',
                    assetId: assetId,
                    tags: {
                        test: true,
                    },
                    settings: {
                        initialUnits: 4,
                        initialValue: 12,
                        initialPrice: 1,
                        e: 1,
                        m: 1,
                    },
                };
                marketMaker = yield marketMakerService.createMarketMaker(makerConfig, false);
                (0, chai_1.expect)(marketMaker).to.exist;
            }));
            describe('Create Basic MarketMaker', () => __awaiter(this, void 0, void 0, function* () {
                it('should create', () => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    const order = src_1.MarketMakerService.generateOrder({
                        assetId: assetId,
                        orderId: 'order1',
                        portfolioId: `asset::${assetId}`,
                        orderSide: 'ask',
                        orderSize: 2,
                    });
                    yield marketMaker.processOrder(order);
                    const readBack = yield marketMakerRepository.getDetailAsync(assetId);
                    if (readBack) {
                        (0, chai_1.expect)((_b = (_a = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _a === void 0 ? void 0 : _a.last) === null || _b === void 0 ? void 0 : _b.side).eq('ask');
                        (0, chai_1.expect)((_d = (_c = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _c === void 0 ? void 0 : _c.last) === null || _d === void 0 ? void 0 : _d.units).eq(2);
                        (0, chai_1.expect)((_f = (_e = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _e === void 0 ? void 0 : _e.last) === null || _f === void 0 ? void 0 : _f.value).eq(8);
                        (0, chai_1.expect)((_h = (_g = readBack === null || readBack === void 0 ? void 0 : readBack.quote) === null || _g === void 0 ? void 0 : _g.last) === null || _h === void 0 ? void 0 : _h.unitValue).eq(4);
                        (0, chai_1.expect)(readBack.params.madeUnits).eq(2);
                        (0, chai_1.expect)(readBack.params.cumulativeValue).eq(4);
                    }
                    else {
                        chai_1.expect.fail('nothing read back');
                    }
                }));
            }));
        });
    });
});
