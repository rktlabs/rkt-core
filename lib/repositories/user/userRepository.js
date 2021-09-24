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
exports.UserRepository = void 0;
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const cacheableRepository_1 = require("../cacheableRepository");
const getConnectionProps_1 = require("../getConnectionProps");
const logger = log4js.getLogger('userRepository');
const COLLECTION_NAME = 'users';
class UserRepository extends cacheableRepository_1.CacheableRepository {
    constructor() {
        super();
        this.filterMap = {
            username: 'username',
            email: 'email',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`getList ${qs}`);
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const userList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    const userId = entityDoc.id;
                    entity.userId = userId; // EJH: if not set in initial set
                    return entity;
                });
                return userList;
            }
            else {
                return [];
            }
        });
    }
    getDetailAsync(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`getDetail ${userId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(userId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            else {
                const entity = entityDoc.data();
                const userId = entityDoc.id;
                entity.userId = userId; // EJH: if not set in initial set
                return entity;
            }
        });
    }
    lookupUserByUserNameAsync(username) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`lookupUserByUserName ${username}`);
            const entityRefCollection = this.db.collection(COLLECTION_NAME).where('username', '==', username);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const userList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    const userId = entityDoc.id;
                    entity.userId = userId; // EJH: not set in initial set
                    return entity;
                });
                return userList[0];
            }
            else {
                return null;
            }
        });
    }
    lookupUserByEmailAsync(email) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`lookupUserByEmail ${email}`);
            const entityRefCollection = this.db.collection(COLLECTION_NAME).where('email', '==', email);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const userList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    const userId = entityDoc.id;
                    entity.userId = userId; // EJH: not set in initial set
                    return entity;
                });
                return userList[0];
            }
            else {
                return null;
            }
        });
    }
    storeAsync(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`store ${entity.userId}`);
            const entityId = entity.userId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    deleteAsync(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${userId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(userId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
    isPortfolioUsed(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked leagues
            const entityRefCollection = this.db.collection(COLLECTION_NAME).where('portfolioId', '==', portfolioId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (entityCollectionRefs.size > 0) {
                const ids = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data();
                    return data.userId;
                });
                const idList = ids.join(', ');
                return idList;
            }
            else {
                return null;
            }
        });
    }
}
exports.UserRepository = UserRepository;
