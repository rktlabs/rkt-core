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
exports.TransactionService = void 0;
const luxon_1 = require("luxon");
const logger = require('log4js').getLogger('transactionHandler');
const errors_1 = require("../errors");
const models_1 = require("../models");
const caches_1 = require("../caches");
const repositories_1 = require("../repositories");
const services_1 = require("../services");
const util_1 = require("../util");
class TransactionService {
    constructor(db, eventPublisher) {
        this.eventPublisher = eventPublisher || new services_1.EventPublisher({ logger: logger });
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.assetCache = new caches_1.AssetCache(db);
        this.portfolioAssetRepository = new repositories_1.PortfolioAssetRepository(db);
        this.transactionRepository = new repositories_1.TransactionRepository(db);
        this.portfolioAssetService = new services_1.PortfolioAssetService(db, eventPublisher);
    }
    /////////////////////////////
    // Public Methods
    /////////////////////////////
    newPurchaseAsync(exchangeData) {
        return __awaiter(this, void 0, void 0, function* () {
            const coinAssetId = 'coin::fantx';
            const transaction = {
                inputs: [
                    {
                        // units in from user portfolio
                        portfolioId: exchangeData.sellerPortfolioId,
                        assetId: exchangeData.assetId,
                        units: exchangeData.units * -1,
                    },
                    {
                        // coins in from asset portfolio
                        portfolioId: exchangeData.buyerPorfolioId,
                        assetId: coinAssetId,
                        units: exchangeData.coins * -1,
                    },
                ],
                outputs: [
                    {
                        // shares out to contract asset
                        portfolioId: exchangeData.buyerPorfolioId,
                        assetId: exchangeData.assetId,
                        units: exchangeData.units,
                    },
                    {
                        // coins out to user portfolio
                        portfolioId: exchangeData.sellerPortfolioId,
                        assetId: coinAssetId,
                        units: exchangeData.coins,
                    },
                ],
            };
            return this.newTransactionAsync(transaction);
        });
    }
    // a transfer is a transaction with one in put, out output, and one asset
    newTransferAsync(transferData) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.debug(`Handle Transfer: ${JSON.stringify(transferData)}`)
            const inputPortfolioId = transferData.inputPortfolioId;
            const outputPortfolioId = transferData.outputPortfolioId;
            const assetId = transferData.assetId;
            const units = transferData.units;
            // const parts = inputPortfolioId.split(':')
            // if (parts.length > 0 && parts[0] === 'mint') {
            //     const msg = `Transfer Failed - input portfolio not valid. Cannot transfer from mint (${inputPortfolioId})`
            //     throw new ConflictError(msg, { payload: transferData })
            // }
            const transaction = {
                inputs: [
                    {
                        portfolioId: inputPortfolioId,
                        assetId: assetId,
                        units: -1 * units,
                    },
                ],
                outputs: [
                    {
                        portfolioId: outputPortfolioId,
                        assetId: assetId,
                        units: units,
                    },
                ],
            };
            if (transferData.tags) {
                transaction.tags = transferData.tags;
            }
            return this.newTransactionAsync(transaction);
        });
    }
    newTransactionAsync(transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.debug(`Handle Create Transaction: ${JSON.stringify(transactionData)}`)
            const transaction = models_1.Transaction.newTransaction(transactionData);
            const transactionId = transaction.transactionId;
            try {
                yield this.transactionRepository.storeTransaction(transaction);
                yield this.validateLegsAsync(transaction);
                yield this.verifyAssetsAsync(transaction);
                let commitStates = [];
                //////////////////////////
                // process input legs first (if they fail, less to clean up)
                if (transaction.inputs) {
                    const inputLegs = transaction.inputs;
                    for (let i = 0; i < inputLegs.length; ++i) {
                        const inputLeg = inputLegs[i];
                        const commitState = this.processLeg(transactionId, inputLeg, transaction.xids);
                        commitStates.push(commitState);
                    }
                }
                //////////////////////////
                // process output legs (very little to make them fail)
                if (transaction.outputs) {
                    const outputLegs = transaction.outputs;
                    for (let i = 0; i < outputLegs.length; ++i) {
                        const outputLeg = outputLegs[i];
                        const commitState = this.processLeg(transactionId, outputLeg, transaction.xids);
                        commitStates.push(commitState);
                    }
                }
                //////////////////////////
                // commit the batch
                {
                    const updates = commitStates.map((commitState) => {
                        return {
                            portfolioId: commitState.portfolioId,
                            assetId: commitState.assetId,
                            deltaUnits: commitState.units,
                            deltaNet: commitState.deltaNet,
                            deltaCost: commitState.deltaCost,
                        };
                    });
                    yield this.portfolioAssetService.proessTransaction(transactionId, updates, transaction);
                }
                //////////////////////////
                // publish events that holdings updated
                // if (transaction.inputs) {
                //     const inputLegs = transaction.inputs
                //     for (let i = 0; i < inputLegs.length; ++i) {
                //         const inputLeg = inputLegs[i]
                //         // eslint-disable-next-line no-await-in-loop
                //         if (this.eventPublisher) {
                //             await this.eventPublisher.publishTransactionEventUpdatePortfolioAsync(
                //                 transaction,
                //                 inputLeg,
                //                 'transactionHandler',
                //             )
                //         }
                //     }
                // }
                // if (transaction.outputs) {
                //     const outputLegs = transaction.outputs
                //     for (let i = 0; i < outputLegs.length; ++i) {
                //         const outputLeg = outputLegs[i]
                //         // eslint-disable-next-line no-await-in-loop
                //         if (this.eventPublisher) {
                //             await this.eventPublisher.publishTransactionEventUpdatePortfolioAsync(
                //                 transaction,
                //                 outputLeg,
                //                 'transactionHandler',
                //             )
                //         }
                //     }
                // }
                transaction.status = 'success';
                yield this.transactionRepository.updateTransaction(transactionId, { status: transaction.status });
                if (this.eventPublisher) {
                    yield this.eventPublisher.publishTransactionEventCompleteAsync(transaction, 'transactionHandler');
                }
                return commitStates;
            }
            catch (error) {
                if (error instanceof errors_1.ValidationError) {
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateTransaction(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler');
                    }
                    throw error;
                }
                else if (error instanceof errors_1.InsufficientBalance) {
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateTransaction(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler');
                    }
                    throw error;
                }
                else if (error instanceof errors_1.InvalidTransaction) {
                    // (*)
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateTransaction(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler');
                    }
                    throw error;
                }
                else {
                    transaction.status = 'error';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateTransaction(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler', error.stack);
                    }
                    throw error; // unknown error, rethrow it (**)
                }
            }
        });
    }
    // fund portfolio from treasury using portfolioId
    mintCoinsToPortfolio(portfolioId, units, sourcePortfolioId = 'contract::mint', assetId = 'coin::fantx') {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
            if (!portfolio) {
                const msg = `Cannot mint to portfolio: ${portfolioId} does not exist`;
                throw new errors_1.NotFoundError(msg, { portfolioId });
            }
            return this.mintCoinsToPortfolioImpl(portfolio, units, sourcePortfolioId, assetId);
        });
    }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    // fund portfolio from treasury - implementation using portfolio entity
    mintCoinsToPortfolioImpl(portfolio, units, sourcePortfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = portfolio.portfolioId;
            const newTransactionData = {
                inputs: [
                    {
                        portfolioId: sourcePortfolioId,
                        assetId,
                        units: units * -1,
                    },
                ],
                outputs: [
                    {
                        portfolioId,
                        assetId,
                        units,
                    },
                ],
                tags: {
                    source: 'FUND_PORTFOLIO',
                },
                xids: {
                    assetId,
                },
            };
            yield this.newTransactionAsync(newTransactionData);
        });
    }
    verifyAssetsAsync(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            //////////////////////////
            // process input legs first - want to fail if input is missing.
            //////////////////////////
            // validate input legs
            if (transaction.inputs) {
                const inputLegs = transaction.inputs;
                for (let i = 0; i < inputLegs.length; ++i) {
                    const inputLeg = inputLegs[i];
                    const portfolioId = inputLeg.portfolioId;
                    const assetId = inputLeg.assetId;
                    const units = inputLeg.units;
                    const assetType = assetId.split(':')[0];
                    const portfolioType = portfolioId.split(':')[0];
                    const isCoin = assetType === 'coin';
                    const isMint = portfolioType === 'mint';
                    const isBank = portfolioType === 'bank';
                    const isMaker = portfolioType === 'maker';
                    const isContract = portfolioType === 'contract';
                    const canShort = isMint || isBank || isMaker || isContract;
                    // EJH TEST TEST TEST
                    // configure so anything can run negative balance
                    //const canShort = true
                    // eslint-disable-next-line no-await-in-loop
                    let holding = yield this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId);
                    if (canShort) {
                        // if can short, create input holding if it doesn't already
                        // exist. new holding may end up with negative balance. (if cannot
                        // short and no holding, then will fail for insufficient balance)
                        if (!holding) {
                            // eslint-disable-next-line no-await-in-loop
                            holding = yield this.portfolioAssetService.newPortfolioAsset(portfolioId, assetId);
                        }
                    }
                    if (!holding) {
                        // not a mint or bank, error if holding no exists
                        const msg = `No input holding - input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId}`;
                        throw new errors_1.InsufficientBalance(msg, { payload: transaction });
                    }
                    if (!canShort) {
                        // if cannot short, verify balance is adequate to complete transaction
                        if (holding.units + units < 0) {
                            const msg = `Insufficient input balance - input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId} units: ${units * -1}`;
                            throw new errors_1.InsufficientBalance(msg, { payload: transaction });
                        }
                    }
                    const unitCost = holding.units === 0 ? 0 : util_1.round4((holding.cost || 0) / holding.units);
                    if (!isCoin) {
                        inputLeg._unitCost = unitCost;
                        inputLeg._deltaCost = util_1.round4(unitCost * units);
                        inputLeg._deltaNet = util_1.round4(inputLeg.cost || 0) * -1;
                    }
                }
            }
            //////////////////////////
            // validate output legs
            if (transaction.outputs) {
                const outputLegs = transaction.outputs;
                for (let i = 0; i < outputLegs.length; ++i) {
                    const outputLeg = outputLegs[i];
                    const portfolioId = outputLeg.portfolioId;
                    const assetId = outputLeg.assetId;
                    const assetType = assetId.split(':')[0];
                    const isCoin = assetType === 'coin';
                    // eslint-disable-next-line no-await-in-loop
                    let holding = yield this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId);
                    if (!holding) {
                        // eslint-disable-next-line no-await-in-loop
                        holding = yield this.portfolioAssetService.newPortfolioAsset(portfolioId, assetId);
                    }
                    if (!isCoin) {
                        outputLeg._deltaCost = util_1.round4(outputLeg.cost || 0);
                        outputLeg._deltaNet = util_1.round4(outputLeg.cost || 0) * -1;
                    }
                }
            }
        });
    }
    // validate the legs. will throw if anything is wrong.
    validateLegsAsync(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            //////////////////////////
            // validate input legs
            if (transaction.inputs) {
                const inputLegs = transaction.inputs;
                for (let i = 0; i < inputLegs.length; ++i) {
                    const inputLeg = inputLegs[i];
                    const portfolioId = inputLeg.portfolioId;
                    const assetId = inputLeg.assetId;
                    const units = inputLeg.units;
                    if (units > 0) {
                        const msg = `Invalid units input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId} units: ${units}`;
                        throw new errors_1.InvalidTransaction(msg);
                    }
                    // verify that asset exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionAsset = yield this.assetCache.lookupAsset(assetId);
                    if (!transactionAsset) {
                        const msg = `Transaction Failed - input assetId not registered (${assetId})`;
                        throw new errors_1.ConflictError(msg, { payload: transaction });
                    }
                    // verify that portfolio exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionPortfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
                    if (!transactionPortfolio) {
                        const msg = `Transaction Failed - input portfolioId not registered (${portfolioId})`;
                        throw new errors_1.ConflictError(msg, { payload: transaction });
                    }
                }
            }
            //////////////////////////
            // validate output legs
            if (transaction.outputs) {
                const outputLegs = transaction.outputs;
                for (let i = 0; i < outputLegs.length; ++i) {
                    const outputLeg = outputLegs[i];
                    const portfolioId = outputLeg.portfolioId;
                    const assetId = outputLeg.assetId;
                    const units = outputLeg.units;
                    // support 0 units to "create" an empty holding
                    if (units < 0) {
                        const msg = `Invalid units output: ${i + 1} portfolio: ${portfolioId} holding: ${assetId} units: ${units}`;
                        throw new errors_1.InvalidTransaction(msg);
                    }
                    // verify that asset exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionAsset = yield this.assetCache.lookupAsset(assetId);
                    if (!transactionAsset) {
                        const msg = `Transaction Failed - output assetId not registered (${assetId})`;
                        throw new errors_1.ConflictError(msg, { payload: transaction });
                    }
                    // verify that portfolio portfolio exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionPortfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
                    if (!transactionPortfolio) {
                        const msg = `Transaction Failed - output portfolioId not registered (${portfolioId})`;
                        throw new errors_1.ConflictError(msg, { payload: transaction });
                    }
                }
            }
            //////////////////////////
            // validate transactions - should balance all inputs and outputs per asset.
            const imbalance = this.verifyTransactionBalance(transaction);
            if (imbalance) {
                // eslint-disable-next-line no-await-in-loop
                const msg = `inputs/outputs not balanced (${imbalance})`;
                throw new errors_1.InvalidTransaction(msg);
            }
        });
    }
    verifyTransactionBalance(transaction) {
        const assetMap = {};
        if (transaction.inputs) {
            for (let i = 0; i < transaction.inputs.length; ++i) {
                const input = transaction.inputs[i];
                const assetId = input.assetId;
                if (assetMap[assetId] === undefined) {
                    assetMap[assetId] = 0;
                }
                assetMap[assetId] += input.units;
            }
        }
        if (transaction.outputs) {
            for (let i = 0; i < transaction.outputs.length; ++i) {
                const output = transaction.outputs[i];
                const assetId = output.assetId;
                if (assetMap[assetId] === undefined) {
                    assetMap[assetId] = 0;
                }
                assetMap[assetId] += output.units;
            }
        }
        for (const assetId in assetMap) {
            if (assetMap[assetId] !== 0) {
                return assetId;
            }
        }
        return null;
    }
    processLeg(transactionId, leg, transactionXids) {
        const timeAtNow = luxon_1.DateTime.utc().toString();
        const commitState = {
            id: util_1.generateId(),
            transactionId: transactionId,
            portfolioId: leg.portfolioId,
            assetId: leg.assetId,
            units: leg.units,
            deltaNet: leg._deltaNet || 0,
            deltaCost: leg._deltaCost || 0,
            timestamp: timeAtNow,
        };
        if (transactionXids) {
            commitState.xids = transactionXids;
        }
        return commitState;
    }
}
exports.TransactionService = TransactionService;
