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
exports.PortfolioService = void 0;
const services_1 = require("../services");
const caches_1 = require("../caches");
const repositories_1 = require("../repositories");
const models_1 = require("../models");
const errors_1 = require("../errors");
class PortfolioService {
    constructor(db, eventPublisher) {
        this.db = db;
        this.eventPublisher = eventPublisher || new services_1.EventPublisher();
        this.portfolioRepository = new repositories_1.PortfolioRepository(db);
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.portfolioActivityRepository = new repositories_1.PortfolioActivityRepository(db);
        this.portfolioDepositRepository = new repositories_1.PortfolioDepositRepository(db);
        this.portfolioAssetService = new services_1.PortfolioAssetService(db, eventPublisher);
    }
    // create new portfolio. Fail if it already exists.
    newPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = payload.portfolioId;
            if (portfolioId) {
                const existing = yield this.portfolioCache.lookupPortfolio(portfolioId);
                if (existing) {
                    const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`;
                    throw new errors_1.DuplicateError(msg, { portfolioId: portfolioId });
                }
            }
            const portfolio = models_1.Portfolio.newPortfolio(payload);
            yield this.portfolioRepository.storePortfolio(portfolio);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishPortfolioNewEventAsync(portfolio, 'portfolioService')
            // }
            return portfolio;
        });
    }
    // ensure that portfolio is created. crate new portfolio and new cache if don't exist
    // leave in place anything already there.
    createPortfolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload || !payload.portfolioId) {
                throw new Error('Portfolio Creation Failed - no portfolioId');
            }
            const promises = [];
            const portfolioId = payload.portfolioId;
            const existing = yield this.portfolioRepository.getPortfolio(portfolioId);
            if (!existing) {
                const portfolio = models_1.Portfolio.newPortfolio(payload);
                promises.push(this.portfolioRepository.storePortfolio(portfolio));
                // if (this.eventPublisher) {
                //     await this.eventPublisher.publishPortfolioNewEventAsync(portfolio, 'portfolioService')
                // }
            }
            return Promise.all(promises);
        });
    }
    updatePortfolio(portfolioId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioRepository.updatePortfolio(portfolioId, payload);
        });
    }
    deletePortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            {
                // check for linked assets
                const entityRefCollection = this.db.collection('assets').where('portfolioId', '==', portfolioId);
                const entityCollectionRefs = yield entityRefCollection.get();
                if (entityCollectionRefs.size > 0) {
                    const assetIds = entityCollectionRefs.docs.map((doc) => {
                        const data = doc.data();
                        return data.assetId;
                    });
                    const assetIdList = assetIds.join(', ');
                    throw new errors_1.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetIdList}`);
                }
            }
            {
                // check for linked makers
                const entityRefCollection = this.db.collection('makers').where('portfolioId', '==', portfolioId);
                const entityCollectionRefs = yield entityRefCollection.get();
                if (entityCollectionRefs.size > 0) {
                    const assetIds = entityCollectionRefs.docs.map((doc) => {
                        const data = doc.data();
                        return data.assetId;
                    });
                    const assetIdList = assetIds.join(', ');
                    throw new errors_1.ConflictError(`Cannot Delete Portfolio. Maker Portfolio in use: ${assetIdList}`);
                }
            }
            {
                // check for linked contracts
                const entityRefCollection = this.db.collection('contracts').where('portfolioId', '==', portfolioId);
                const entityCollectionRefs = yield entityRefCollection.get();
                if (entityCollectionRefs.size > 0) {
                    const contractIds = entityCollectionRefs.docs.map((doc) => {
                        const data = doc.data();
                        return data.contractId;
                    });
                    const assetIdList = contractIds.join(', ');
                    throw new errors_1.ConflictError(`Cannot Delete Portfolio. Portfolio linked to contract: ${assetIdList}`);
                }
            }
            yield this.portfolioAssetService.scrubPortfolioAssets(portfolioId);
            yield this.portfolioActivityRepository.scrubPortfolioActivityCollection(portfolioId);
            yield this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId);
            yield this.portfolioRepository.deletePortfolio(portfolioId);
        });
    }
    scrubPortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.portfolioAssetService.scrubPortfolioAssets(portfolioId);
            yield this.portfolioActivityRepository.scrubPortfolioActivityCollection(portfolioId);
            yield this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId);
            yield this.portfolioRepository.deletePortfolio(portfolioId);
        });
    }
    submitPortfolioDeposit(deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = deposit.portfolioId;
            yield this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit);
            const deposits = yield this.computePortfolioNetDeposits(portfolioId);
            this.updatePortfolio(portfolioId, { deposits: deposits });
        });
    }
    computePortfolioNetDeposits(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deposits = yield this.portfolioDepositRepository.listPortfolioDeposits(portfolioId);
            const total = deposits.reduce((acc, deposit) => {
                return acc + deposit.units;
            }, 0);
            return total;
        });
    }
}
exports.PortfolioService = PortfolioService;
