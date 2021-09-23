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
describe('League', () => {
    const leagueId = 'my-league';
    describe('Create New League', () => {
        it('no displayname should default to leagueId', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
            };
            const league = models_1.League.newLeague(data);
            (0, chai_1.expect)(league.displayName).to.eq(leagueId);
        }));
        it('use displayName if supplied', () => __awaiter(void 0, void 0, void 0, function* () {
            const displayName = 'thisisme';
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                displayName: displayName,
            };
            const league = models_1.League.newLeague(data);
            (0, chai_1.expect)(league.displayName).to.eq(displayName);
        }));
    });
});
