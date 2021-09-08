"use strict";
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
exports.UserQuery = void 0;
const userRepository_1 = require("../repositories/userRepository");
class UserQuery {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.userRepository.getListAsync(qs),
            };
        });
    }
    getDetailAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDetail = yield this.userRepository.getDetailAsync(id);
            return userDetail;
        });
    }
}
exports.UserQuery = UserQuery;
