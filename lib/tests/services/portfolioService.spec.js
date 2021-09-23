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
const chai = require("chai");
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
const src_1 = require("../../src");
describe('Portfolio Service', function () {
    this.timeout(5000);
    let portfolioRepository;
    let portfolioService;
    let portfolioId = 'aaa::test1';
    before(() => __awaiter(this, void 0, void 0, function* () {
        portfolioRepository = new src_1.PortfolioRepository();
        portfolioService = new src_1.PortfolioService();
    }));
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        yield portfolioService.scrubPortfolio(portfolioId);
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield portfolioService.scrubPortfolio(portfolioId);
    }));
    describe('New Portfolio where none exists', () => {
        it('should create new portfolio1', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            yield portfolioService.createPortfolio(data);
            const readBack = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack).to.exist;
        }));
    });
    describe('Create Portfolio where none exists', () => {
        it('should create new portfolio2', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            yield portfolioService.createPortfolio(data);
            const readBack = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack).to.exist;
        }));
    });
    describe('New Portfolio where one exists', () => {
        it('should fail with exception', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            yield portfolioService.createPortfolio(data);
            yield portfolioService
                .createPortfolio(data)
                .then(() => {
                chai_1.assert.fail('Function should not complete');
            })
                .catch((error) => {
                (0, chai_1.expect)(error).to.be.instanceOf(Error);
                (0, chai_1.expect)(error.message).to.eq('Portfolio Creation Failed - portfolioId: aaa::test1 already exists');
            });
        }));
    });
    describe.skip('Create Portfolio where already exists', () => {
        it('should create new portfolio3', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            yield portfolioService.createPortfolio(data);
            const readBack = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack).to.exist;
            yield portfolioService.createPortfolio(data);
            const readBack2 = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(readBack2).to.exist;
        }));
    });
});
