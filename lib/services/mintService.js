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
exports.MintService = void 0;
const _1 = require(".");
const __1 = require("..");
const MINT_PORTFOLIO = 'bank::mint';
class MintService {
    constructor(me, eventPublisher) {
        this.me = me;
        this.eventPublisher = eventPublisher || new _1.NullEventPublisher();
        this.assetRepository = new __1.AssetRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.transactionService = new _1.TransactionService(this.eventPublisher);
    }
    mintUnits(assetId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Cannot deposit to asset: ${assetId} does not exist`;
                throw new __1.NotFoundError(msg, { userId: assetId });
            }
            const portfolioId = asset.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to asset: no portfolioId`;
                throw new __1.NotFoundError(msg, { userId: assetId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const sourcePortfolioId = MINT_PORTFOLIO;
            const data = {
                inputPortfolioId: sourcePortfolioId,
                outputPortfolioId: portfolioId,
                assetId: assetId,
                units: units,
                tags: {
                    source: 'Mint',
                },
            };
            yield this.transactionService.executeTransferAsync(data);
            this.assetRepository.addMinted(assetId, units);
        });
    }
    burnUnits(assetId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Cannot deposit to asset: ${assetId} does not exist`;
                throw new __1.NotFoundError(msg, { userId: assetId });
            }
            const portfolioId = asset.portfolioId;
            if (!portfolioId) {
                const msg = `Cannot deposit to asset: no portfolioId`;
                throw new __1.NotFoundError(msg, { userId: assetId });
            }
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`;
                throw new __1.NotFoundError(msg, { portfolioId });
            }
            const sourcePortfolioId = MINT_PORTFOLIO;
            const data = {
                inputPortfolioId: portfolioId,
                outputPortfolioId: sourcePortfolioId,
                assetId: assetId,
                units: units,
                tags: {
                    source: 'Burn',
                },
            };
            yield this.transactionService.executeTransferAsync(data);
            this.assetRepository.addBurned(assetId, units);
        });
    }
}
exports.MintService = MintService;
