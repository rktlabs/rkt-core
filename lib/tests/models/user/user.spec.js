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
describe('User', () => {
    it('new user should have no portfolioId', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            userId: '11111',
            dob: '1/2/2021',
            email: 'bjcleaver@cleaver.com',
            name: 'Boris Cleaver',
            username: 'bjcleaver',
        };
        const user = models_1.User.newUser(data);
        (0, chai_1.expect)(user.portfolioId).to.not.exist;
        (0, chai_1.expect)(user.userId).to.eq('11111');
    }));
    describe('Create New User', () => {
        it('new user should have no portfolioId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            };
            const user = models_1.User.newUser(data);
            (0, chai_1.expect)(user.portfolioId).to.not.exist;
        }));
        it('no displayname should default to userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            };
            const user = models_1.User.newUser(data);
            (0, chai_1.expect)(user.displayName).to.eq('Boris Cleaver');
            (0, chai_1.expect)(user.portfolioId).to.not.exist;
        }));
        it('use displayName if supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
                displayName: 'other',
            };
            const user = models_1.User.newUser(data);
            (0, chai_1.expect)(user.displayName).to.eq('other');
        }));
    });
});
