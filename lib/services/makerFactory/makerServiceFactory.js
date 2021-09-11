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
exports.MakerServiceFactory = void 0;
const kmaker_1 = require("./makers/kmaker");
const bondingmaker1_1 = require("./makers/bondingmaker1");
const bondingmaker2_1 = require("./makers/bondingmaker2");
const logisticmaker1_1 = require("./makers/logisticmaker1");
const __1 = require("../..");
class MakerServiceFactory {
    constructor() {
        this.makerRepository = new __1.MakerRepository();
    }
    initializeParams(makerProps) {
        switch (makerProps.type) {
            case 'constantk':
                const kMakerService = new kmaker_1.KMakerService();
                return kMakerService.initializeParams(makerProps);
            case 'bondingmaker1':
                const bmakerService1 = new bondingmaker1_1.BondingMaker1Service();
                return bmakerService1.initializeParams(makerProps);
            case 'bondingmaker2':
                const bmakerService2 = new bondingmaker2_1.BondingMaker2Service();
                return bmakerService2.initializeParams(makerProps);
            case 'logisticmaker1':
                const logisticmakerService1 = new logisticmaker1_1.LogisticMaker1Service();
                return logisticmakerService1.initializeParams(makerProps);
            default:
                const defaultMakerService = new kmaker_1.KMakerService();
                return defaultMakerService.initializeParams(makerProps);
        }
    }
    takeUnits(assetId, takeSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // have to get the maker to get the type. Get if from a "plain" repo
            const maker = yield this.makerRepository.getDetailAsync(assetId);
            if (!maker) {
                return null;
            }
            switch (maker.type) {
                case 'constantk':
                    const kMakerService = new kmaker_1.KMakerService();
                    return kMakerService.takeUnits(assetId, takeSize);
                case 'bondingmaker1':
                    const bmakerService1 = new bondingmaker1_1.BondingMaker1Service();
                    return bmakerService1.takeUnits(assetId, takeSize);
                case 'bondingmaker2':
                    const bmakerService2 = new bondingmaker2_1.BondingMaker2Service();
                    return bmakerService2.takeUnits(assetId, takeSize);
                case 'logisticmaker1':
                    const logisticmakerService1 = new logisticmaker1_1.LogisticMaker1Service();
                    return logisticmakerService1.takeUnits(assetId, takeSize);
                default:
                    const defaultMakerService = new kmaker_1.KMakerService();
                    return defaultMakerService.takeUnits(assetId, takeSize);
            }
        });
    }
}
exports.MakerServiceFactory = MakerServiceFactory;
