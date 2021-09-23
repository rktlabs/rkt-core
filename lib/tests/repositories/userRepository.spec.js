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
describe('User Repository', () => {
    let userRepository;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        userRepository = new repositories_1.UserRepository();
    }));
    describe('Create Basic User', () => {
        it('should create', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            };
            const user = models_1.User.newUser(data);
            yield userRepository.storeAsync(user);
            const userId = user.userId;
            const readBack = yield userRepository.getDetailAsync(userId);
            (0, chai_1.expect)(readBack).to.exist;
            (0, chai_1.expect)(readBack.userId).to.exist;
            yield userRepository.deleteAsync(userId);
        }));
    });
    describe('Create Full User', () => {
        it('should create', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
                displayName: 'aaa',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
            };
            const user = models_1.User.newUser(data);
            yield userRepository.storeAsync(user);
            const userId = user.userId;
            const readBack = yield userRepository.getDetailAsync(userId);
            (0, chai_1.expect)(readBack).to.exist;
            if (readBack) {
                (0, chai_1.expect)(readBack.dob).to.eq('1/2/2021');
                (0, chai_1.expect)(readBack.email).to.eq('bjcleaver@cleaver.com');
                (0, chai_1.expect)(readBack.name).to.eq('Boris Cleaver');
                (0, chai_1.expect)(readBack.username).to.eq('bjcleaver');
                (0, chai_1.expect)(readBack.displayName).to.eq('aaa');
                (0, chai_1.expect)(readBack).to.have.property('tags');
                (0, chai_1.expect)(readBack.tags).to.have.property('tag1');
            }
            yield userRepository.deleteAsync(userId);
        }));
    });
    describe('Filtered Users', () => {
        it('should list users', () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [];
            users.push(models_1.User.newUser({
                dob: '1/2/2021',
                email: 'b1@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver1',
            }));
            users.push(models_1.User.newUser({
                dob: '1/2/2021',
                email: 'b2@cleaver.com',
                name: 'Ben Cleaver',
                username: 'bjcleaver2',
            }));
            users.push(models_1.User.newUser({
                dob: '1/2/2021',
                email: 'b3@cleaver.com',
                name: 'Betty Cleaver',
                username: 'bjcleaver3',
            }));
            users.push(models_1.User.newUser({
                dob: '1/2/2021',
                email: 'b4@cleaver.com',
                name: 'Blake Cleaver',
                username: 'bjcleaver4',
            }));
            {
                const promises = [];
                users.forEach((user) => {
                    promises.push(userRepository.storeAsync(user));
                });
                yield Promise.all(promises);
            }
            const userList = yield userRepository.getListAsync({ username: 'bjcleaver4' });
            (0, chai_1.expect)(userList.length).to.eq(1);
            (0, chai_1.expect)(userList[0].username).to.eql('bjcleaver4');
            {
                const promises = [];
                users.forEach((user) => {
                    promises.push(userRepository.deleteAsync(user.userId));
                });
                yield Promise.all(promises);
            }
        }));
    });
});
