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
describe('Portfolio', () => {
    const portfolioId = 'aaa::test1';
    describe('Create New Portfolio', () => {
        it('no displayname should default to portfolioId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            };
            const portfolio = models_1.Portfolio.newPortfolio(data);
            (0, chai_1.expect)(portfolio.displayName).to.eq(portfolioId);
        }));
        it('use displayName if supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const displayName = 'thisisme';
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
                displayName: displayName,
            };
            const portfolio = models_1.Portfolio.newPortfolio(data);
            (0, chai_1.expect)(portfolio.displayName).to.eq(displayName);
        }));
        it('generate typed portfolioId if portfolioId not supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
            };
            const portfolio = models_1.Portfolio.newPortfolio(data);
            (0, chai_1.expect)(portfolio.portfolioId).is.not.null;
            const type = portfolio.portfolioId.split(':')[0];
            (0, chai_1.expect)(type).is.eq('aaa');
        }));
    });
});
