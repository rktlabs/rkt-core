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
exports.ContractService = void 0;
const log4js_1 = require("log4js");
// lint:disable: no-console
const errors_1 = require("../errors");
const models_1 = require("../models");
const caches_1 = require("../caches");
const repositories_1 = require("../repositories");
const services_1 = require("../services");
class ContractService {
    constructor(db, eventPublisher) {
        this.db = db;
        this.logger = log4js_1.getLogger(this.constructor.name);
        this.assetRepository = new repositories_1.AssetRepository(db);
        this.assetHolderRepository = new repositories_1.AssetHolderRepository(db);
        this.assetCache = new caches_1.AssetCache(db);
        this.contractRepository = new repositories_1.ContractRepository(db);
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.portfolioAssetRepository = new repositories_1.PortfolioAssetRepository(db);
        this.portfolioService = new services_1.PortfolioService(db, eventPublisher);
        this.portfolioAssetService = new services_1.PortfolioAssetService(db, eventPublisher);
        this.transactionService = new services_1.TransactionService(db, eventPublisher);
        this.assetService = new services_1.AssetService(db, eventPublisher);
        this.makerService = new services_1.MakerService(db, eventPublisher);
    }
    newContract(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractId = payload.contractId;
            if (contractId) {
                // check for existing contract with that Id. If exists, then fail out.
                const contract = yield this.contractRepository.getContract(contractId);
                if (contract) {
                    const msg = `Contract Creation Failed - contractId: ${contractId} already exists`;
                    throw new errors_1.DuplicateError(msg, { contractId });
                }
                // check for existence of contract portfolio (shouldn't exist if contract doesn't exist)
                const portfolioId = `contract::${contractId}`;
                const portfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
                if (portfolio) {
                    const msg = `Contract Creation Failed - Contract portfolioId: ${portfolioId} already exists`;
                    throw new errors_1.ConflictError(msg, { portfolioId });
                }
            }
            const contract = yield this.createContractImpl(payload);
            return contract;
        });
    }
    deleteContract(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            {
                // check for linked assets
                const entityRefCollection = this.db.collection('assets').where('contractId', '==', contractId);
                const entityCollectionRefs = yield entityRefCollection.get();
                if (entityCollectionRefs.size > 0) {
                    const assetIds = entityCollectionRefs.docs.map((doc) => {
                        const data = doc.data();
                        return data.assetId;
                    });
                    const assetIdList = assetIds.join(', ');
                    throw new errors_1.ConflictError(`Asset in use: ${assetIdList}`);
                }
            }
            const contract = yield this.contractRepository.getContract(contractId);
            if (contract) {
                const portfolioId = contract.portfolioId;
                yield this.contractRepository.deleteContract(contractId);
                yield this.portfolioService.deletePortfolio(portfolioId);
            }
        });
    }
    scrubContract(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub all of the owned assets
            const managedAssetIds = yield this.assetRepository.listContractAssets(contractId);
            const promises = [];
            managedAssetIds.forEach((assetId) => {
                promises.push(this.scrubContractAsset(assetId));
            });
            // scrub the associated portfolio
            const portfolioId = `contract::${contractId}`;
            promises.push(this.portfolioService.scrubPortfolio(portfolioId));
            // scrub the contraact
            promises.push(this.contractRepository.deleteContract(contractId));
            yield Promise.all(promises);
        });
    }
    scrubContractAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            promises.push(this.makerService.scrubMaker(assetId));
            promises.push(this.assetService.scrubAsset(assetId));
            return Promise.all(promises);
        });
    }
    setupContractEarnerList(contractSpec, assetList) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = typeof contractSpec === 'string' ? yield this.contractRepository.getContract(contractSpec) : contractSpec;
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractSpec}`);
            }
            if (assetList && assetList.length > 0) {
                yield Promise.all(assetList.map((playerData) => {
                    return this.newAssetImpl(contract, playerData);
                }));
            }
        });
    }
    // create a simple asset (coin) that has no maker, no start, no end, no terms.
    newSimpleAsset(contractSpec, type, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = typeof contractSpec === 'string' ? yield this.contractRepository.getContract(contractSpec) : contractSpec;
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractSpec}`);
            }
            const fullSymbol = `${type}::${symbol}`;
            const displayName = symbol.charAt(0).toUpperCase() + symbol.slice(1); // capitalize
            const assetConfig = {
                ownerId: contract.ownerId,
                symbol: fullSymbol,
                displayName: displayName,
                contractId: contract.contractId,
                contractDisplayName: contract.displayName,
                initialPrice: 1,
            };
            const asset = yield this.assetService.newAsset(assetConfig);
            yield this.addAssetToContract(contract, asset);
            return asset;
        });
    }
    newAsset(contractSpec, assetDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = typeof contractSpec === 'string' ? yield this.contractRepository.getContract(contractSpec) : contractSpec;
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractSpec}`);
            }
            yield this.newAssetImpl(contract, assetDef);
        });
    }
    fundContractAsync(contractSpec, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = typeof contractSpec === 'string' ? yield this.contractRepository.getContract(contractSpec) : contractSpec;
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractSpec}`);
            }
            return this.fundContractImplAsync(contract, units);
        });
    }
    getContractFunds(contractSpec) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = typeof contractSpec === 'string' ? yield this.contractRepository.getContract(contractSpec) : contractSpec;
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractSpec}`);
            }
            const balance = this.portfolioAssetService.getPortfolioAssetBalance(contract.portfolioId, contract.currencyId);
            return balance;
        });
    }
    getAssetUnitsIssued(assetSpec) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const assetId = asset.assetId;
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                const msg = `Cannot get balance. contract: ${contractId} does not exist`;
                throw new errors_1.NotFoundError(msg, { contractId });
            }
            const portfolioId = contract.portfolioId;
            const par = yield this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId);
            if (!par) {
                return 0;
            }
            else {
                return par.units;
            }
        });
    }
    buyContractAsset(portfolioSpec, assetSpec, units, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolio = typeof portfolioSpec === 'string' ? yield this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec;
            if (!portfolio) {
                const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`;
                throw new errors_1.NotFoundError(msg, { portfolioSpec });
            }
            const portfolioId = portfolio.portfolioId;
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const assetId = asset.assetId;
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                const msg = `Cannot transaction with contract: ${contractId} does not exist`;
                throw new errors_1.NotFoundError(msg, { contractId });
            }
            const contractPortfolioId = contract.portfolioId;
            const data = {
                buyerPorfolioId: portfolioId,
                sellerPortfolioId: contractPortfolioId,
                assetId: assetId,
                units: units,
                coins: cost,
            };
            yield this.transactionService.newPurchaseAsync(data);
        });
    }
    sellAssetToContract(portfolioSpec, assetSpec, units, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace(`enter sellAssetToContract(${portfolioSpec}, ${JSON.stringify(assetSpec)}, ${units}, ${cost})`);
            const portfolio = typeof portfolioSpec === 'string' ? yield this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec;
            if (!portfolio) {
                const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`;
                throw new errors_1.NotFoundError(msg, { portfolioSpec });
            }
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                const msg = `Cannot transaction with contract: ${contractId} does not exist`;
                throw new errors_1.NotFoundError(msg, { contractId });
            }
            return this.sellAssetToContractImpl(portfolio, contract, asset, units, cost);
        });
    }
    mintContractAssetUnitsToPortfolio(portfolioSpec, assetSpec, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const portfolio = typeof portfolioSpec === 'string' ? yield this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec;
            if (!portfolio) {
                const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`;
                throw new errors_1.NotFoundError(msg, { portfolioSpec });
            }
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                const msg = `Cannot mint to portfolio: ${contractId} does not exist`;
                throw new errors_1.NotFoundError(msg, { contractId });
            }
            return this.mintContractAssetUnitsToPortfolioImpl(portfolio, asset, units);
        });
    }
    redeemPortfolioHolding(portfolioSpec, assetSpec, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolio = typeof portfolioSpec === 'string' ? yield this.portfolioCache.lookupPortfolio(portfolioSpec) : portfolioSpec;
            if (!portfolio) {
                const msg = `Cannot transaction with portfolio. ${portfolioSpec} does not exist`;
                throw new errors_1.NotFoundError(msg, { portfolioSpec });
            }
            const portfolioId = portfolio.portfolioId;
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const assetId = asset.assetId;
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractId}`);
            }
            // don't redeem anything if the holder portfolio is the contract's portfilio
            if (contract.portfolioId === portfolio.portfolioId) {
                return;
            }
            const holdingAsset = yield this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId);
            if (!holdingAsset) {
                throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`);
            }
            if (holdingAsset.units < units) {
                throw new Error(`Holding Asset Not Found: ${portfolioId}/${assetId}`);
            }
            // cumulativeEarnings must be positive (or 0)
            this.logger.trace(asset);
            const cumulativeEarnings = Math.max(asset.cumulativeEarnings || 0, 0);
            const coinUnits = units * cumulativeEarnings;
            // contract buy back asset
            return this.sellAssetToContract(portfolio, asset, units, coinUnits);
        });
    }
    redeemAsset(assetSpec) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace(`enter redeemAsset(${assetSpec})`);
            const asset = typeof assetSpec === 'string' ? yield this.assetCache.lookupAsset(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            const assetId = asset.assetId;
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                throw new Error(`Contract Not Found: ${contractId}`);
            }
            const assetHolders = yield this.assetHolderRepository.listAssetHolders(assetId);
            if (!assetHolders || assetHolders.length === 0) {
                return;
            }
            // for each holder, redeem their units.
            const promises = [];
            assetHolders.map((assetHolder) => {
                const holderPortfolioId = assetHolder.portfolioId;
                const units = assetHolder.units;
                promises.push(this.redeemPortfolioHolding(holderPortfolioId, assetId, units));
            }),
                yield Promise.all(promises);
        });
    }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    createContractImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = models_1.Contract.newContract(payload);
            const portfolioId = yield this.createContractPortfolioImpl(contract);
            contract.portfolioId = portfolioId;
            yield this.contractRepository.storeContract(contract);
            return contract;
        });
    }
    createContractPortfolioImpl(contract) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = `${contract.displayName} value portfolio`;
            const contractPortfolioDef = {
                type: 'contract',
                portfolioId: `contract::${contract.contractId}`,
                ownerId: contract.ownerId,
                displayName: displayName,
                tags: {
                    source: 'CONTRACT_CREATION',
                },
            };
            const portfolio = yield this.portfolioService.newPortfolio(contractPortfolioDef);
            return portfolio.portfolioId;
        });
    }
    sellAssetToContractImpl(portfolio, contract, asset, units, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = portfolio.portfolioId;
            const assetId = asset.assetId;
            const contractPortfolioId = contract.portfolioId;
            const data = {
                buyerPorfolioId: contractPortfolioId,
                sellerPortfolioId: portfolioId,
                assetId: assetId,
                units: units,
                coins: cost,
            };
            yield this.transactionService.newPurchaseAsync(data);
        });
    }
    mintContractAssetUnitsToPortfolioImpl(portfolio, asset, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = portfolio.portfolioId;
            const contractId = asset.contractId;
            const contract = yield this.contractRepository.getContract(contractId);
            if (!contract) {
                const msg = `Cannot mint to portfolio: ${contractId} does not exist`;
                throw new errors_1.NotFoundError(msg, { contractId });
            }
            const sourcePortfolioId = contract.portfolioId;
            const data = {
                inputPortfolioId: sourcePortfolioId,
                outputPortfolioId: portfolioId,
                assetId: asset.assetId,
                units: units,
            };
            return this.transactionService.newTransferAsync(data);
        });
    }
    newAssetImpl(contract, assetDef) {
        return __awaiter(this, void 0, void 0, function* () {
            const earnerSymbol = assetDef.earnerId;
            const initialPrice = assetDef.initialPrice;
            const displayName = assetDef.displayName;
            const assetSymbol = `${earnerSymbol}::${contract.contractId}`;
            const assetConfig = {
                ownerId: contract.ownerId,
                symbol: assetSymbol,
                displayName: displayName,
                initialPrice: initialPrice,
                contractId: contract.contractId,
                contractDisplayName: contract.displayName,
                earnerId: earnerSymbol,
                earnerDisplayName: displayName,
            };
            try {
                const asset = yield this.assetService.newAsset(assetConfig);
                console.log(`new asset: ${asset.assetId} `);
                yield this.addAssetToContract(contract, asset);
                const makerProps = {
                    type: 'logisticmaker1',
                    ownerId: contract.ownerId,
                    assetId: assetSymbol,
                    settings: {
                        initPrice: initialPrice,
                        limit: 640,
                        coinPool: 500 * 10000,
                        // EJH: New Asset Maker Props set here.
                    },
                    // initialPoolUnits: 1000, // EJH: Just to get started.
                };
                yield this.makerService.newMaker(makerProps);
            }
            catch (err) {
                console.log(`new asset error: ${assetConfig.symbol} - ${err}`);
            }
        });
    }
    addAssetToContract(contract, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.contractRepository.addContractAsset(contract.contractId, asset.assetId);
            // const contractId = contract.contractId
            // const currentList = contract.managedAssets || []
            // currentList.push(asset.assetId)
            // const data: TContractUpdate = { managedAssets: currentList }
            // await this.contractRepository.updateContract(contractId, data)
        });
    }
    fundContractImplAsync(contract, units) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = contract.currencyId;
            const sourcePortfolioId = contract.currencySource;
            const portfolioId = contract.portfolioId;
            const data = {
                inputPortfolioId: sourcePortfolioId,
                outputPortfolioId: portfolioId,
                assetId: assetId,
                units: units,
            };
            return this.transactionService.newTransferAsync(data);
        });
    }
}
exports.ContractService = ContractService;
