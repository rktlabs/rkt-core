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
const log4js = require("log4js");
const luxon_1 = require("luxon");
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger('transactionService');
class TransactionService {
    constructor(assetRepository, portfolioRepository, transactionRepository, eventPublisher) {
        this.eventPublisher = eventPublisher || new _1.NullNotificationPublisher();
        this.portfolioRepository = portfolioRepository;
        this.assetRepository = assetRepository;
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.transactionRepository = transactionRepository;
        this.assetHolderService = new _1.AssetHolderService(this.assetRepository);
    }
    /////////////////////////////
    // Public Methods
    /////////////////////////////
    executePurchaseAsync(exchangeData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`executePurchase: ${JSON.stringify(exchangeData)}`);
            // takes simple structure and fills out the rest:
            // eg:
            // const data: TPurchase = {
            //     buyerPorfolioId: leaguePortfolioId,
            //     sellerPortfolioId: portfolioId,
            //     assetId: assetId,
            //     units: units,
            // }
            const coinAssetId = 'coin::rkt';
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
                        // shares out to league asset
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
            return this.executeTransactionAsync(transaction);
        });
    }
    // a transfer is a transaction with one input, out output, and one asset
    executeTransferAsync(transferData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`executeTransfer: ${JSON.stringify(transferData)}`);
            const inputPortfolioId = transferData.inputPortfolioId;
            const outputPortfolioId = transferData.outputPortfolioId;
            const assetId = transferData.assetId;
            const units = transferData.units;
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
            return this.executeTransactionAsync(transaction);
        });
    }
    executeTransactionAsync(transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`executeTransaction ${JSON.stringify(transactionData)}`);
            const transaction = __1.Transaction.newTransaction(transactionData);
            const transactionId = transaction.transactionId;
            try {
                yield this.transactionRepository.storeAsync(transaction);
                yield this._validateLegsAsync(transaction);
                yield this._verifyAssetsAsync(transaction);
                let commitStates = [];
                //////////////////////////
                // process input legs first (if they fail, less to clean up)
                if (transaction.inputs) {
                    const inputLegs = transaction.inputs;
                    for (let i = 0; i < inputLegs.length; ++i) {
                        const inputLeg = inputLegs[i];
                        const commitState = this._processLeg(transactionId, inputLeg, transaction.xids);
                        commitStates.push(commitState);
                    }
                }
                //////////////////////////
                // process output legs (very little to make them fail)
                if (transaction.outputs) {
                    const outputLegs = transaction.outputs;
                    for (let i = 0; i < outputLegs.length; ++i) {
                        const outputLeg = outputLegs[i];
                        const commitState = this._processLeg(transactionId, outputLeg, transaction.xids);
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
                        };
                    });
                    yield this.assetHolderService.proessTransaction(transactionId, updates, transaction);
                }
                transaction.status = 'success';
                yield this.transactionRepository.updateAsync(transactionId, { status: transaction.status });
                if (this.eventPublisher) {
                    yield this.eventPublisher.publishTransactionEventCompleteAsync(transaction, 'transactionHandler');
                }
                return commitStates;
            }
            catch (error) {
                if (error instanceof __1.ValidationError) {
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateAsync(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler');
                    }
                    throw error;
                }
                else if (error instanceof __1.InsufficientBalance) {
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateAsync(transactionId, {
                        status: transaction.status,
                        error: transaction.error,
                    });
                    if (this.eventPublisher) {
                        yield this.eventPublisher.publishTransactionEventErrorAsync(transaction, error.message, 'transactionHandler');
                    }
                    throw error;
                }
                else if (error instanceof __1.InvalidTransaction) {
                    // (*)
                    // nothing will have been done yet so nothing to roll back
                    transaction.status = 'failed';
                    transaction.error = error.message;
                    yield this.transactionRepository.updateAsync(transactionId, {
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
                    yield this.transactionRepository.updateAsync(transactionId, {
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
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _verifyAssetsAsync(transaction) {
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
                    const portfolioType = portfolioId.split(':')[0];
                    const isBank = portfolioType === 'bank';
                    const canShort = isBank;
                    // eslint-disable-next-line no-await-in-loop
                    let holding = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
                    if (canShort) {
                        // if can short, create input holding if it doesn't already
                        // exist. new holding may end up with negative balance. (if cannot
                        // short and no holding, then will fail for insufficient balance)
                        if (!holding) {
                            // eslint-disable-next-line no-await-in-loop
                            holding = yield this.assetHolderService.addAssetHolder(assetId, portfolioId);
                        }
                    }
                    if (!holding) {
                        // not a mint or bank, error if holding no exists
                        const msg = `No input holding - input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId}`;
                        throw new __1.InsufficientBalance(msg, { payload: transaction });
                    }
                    if (!canShort) {
                        // if cannot short, verify balance is adequate to complete transaction
                        if (holding.units + units < 0) {
                            const msg = `Insufficient input balance - input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId} units: ${units * -1}`;
                            throw new __1.InsufficientBalance(msg, { payload: transaction });
                        }
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
                    let holding = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
                    if (!holding) {
                        // eslint-disable-next-line no-await-in-loop
                        holding = yield this.assetHolderService.addAssetHolder(assetId, portfolioId);
                    }
                }
            }
        });
    }
    // validate the legs. will throw if anything is wrong.
    _validateLegsAsync(transaction) {
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
                        throw new __1.InvalidTransaction(msg);
                    }
                    // verify that asset exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionAsset = yield this.assetRepository.getDetailAsync(assetId);
                    if (!transactionAsset) {
                        const msg = `Transaction Failed - input assetId not registered (${assetId})`;
                        throw new __1.ConflictError(msg, { payload: transaction });
                    }
                    // verify that portfolio exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionPortfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (!transactionPortfolio) {
                        const msg = `Transaction Failed - input portfolioId not registered (${portfolioId})`;
                        throw new __1.ConflictError(msg, { payload: transaction });
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
                        throw new __1.InvalidTransaction(msg);
                    }
                    // verify that asset exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionAsset = yield this.assetRepository.getDetailAsync(assetId);
                    if (!transactionAsset) {
                        const msg = `Transaction Failed - output assetId not registered (${assetId})`;
                        throw new __1.ConflictError(msg, { payload: transaction });
                    }
                    // verify that portfolio portfolio exists.
                    // eslint-disable-next-line no-await-in-loop
                    const transactionPortfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (!transactionPortfolio) {
                        const msg = `Transaction Failed - output portfolioId not registered (${portfolioId})`;
                        throw new __1.ConflictError(msg, { payload: transaction });
                    }
                }
            }
            //////////////////////////
            // validate transactions - should balance all inputs and outputs per asset.
            const imbalance = this._verifyTransactionBalance(transaction);
            if (imbalance) {
                // eslint-disable-next-line no-await-in-loop
                const msg = `inputs/outputs not balanced (${imbalance})`;
                throw new __1.InvalidTransaction(msg);
            }
        });
    }
    _verifyTransactionBalance(transaction) {
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
    _processLeg(transactionId, leg, transactionXids) {
        const timeAtNow = luxon_1.DateTime.utc().toString();
        const commitState = {
            id: (0, __1.generateId)(),
            transactionId: transactionId,
            portfolioId: leg.portfolioId,
            assetId: leg.assetId,
            units: leg.units,
            timestamp: timeAtNow,
        };
        if (transactionXids) {
            commitState.xids = transactionXids;
        }
        return commitState;
    }
}
exports.TransactionService = TransactionService;
