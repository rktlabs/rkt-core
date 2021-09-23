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
describe('Portfolio Repository', () => {
    let portfolioRepository;
    const portfolioId = 'aaa::test1';
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        portfolioRepository = new repositories_1.PortfolioRepository();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // clean out records.
        yield portfolioRepository.deleteAsync(portfolioId);
    }));
    describe('Create Basic Portfolio', () => {
        it('should create', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            const portfolio = models_1.Portfolio.newPortfolio(data);
            yield portfolioRepository.storeAsync(portfolio);
            const readBack = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack).to.exist;
        }));
    });
    describe('Create Full Portfolio', () => {
        it('should create', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
                displayName: 'display-me',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
                xids: {
                    id1: 'xxx',
                    id2: 'yyy',
                },
            };
            const portfolio = models_1.Portfolio.newPortfolio(data);
            yield portfolioRepository.storeAsync(portfolio);
            const readBack = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack).to.exist;
            if (readBack) {
                (0, chai_1.expect)(readBack.type).to.eq('aaa');
                (0, chai_1.expect)(readBack.ownerId).to.eq('tester');
                (0, chai_1.expect)(readBack.portfolioId).to.eq(portfolioId);
                (0, chai_1.expect)(readBack.displayName).to.eq('display-me');
                (0, chai_1.expect)(readBack).to.have.property('tags');
                (0, chai_1.expect)(readBack.tags).to.have.property('tag1');
                (0, chai_1.expect)(readBack).to.have.property('xids');
                (0, chai_1.expect)(readBack.xids).to.have.property('id1');
            }
        }));
    });
});
