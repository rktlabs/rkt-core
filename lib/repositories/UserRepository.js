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
const deleters_1 = require("../util/deleters");
// import * as admin from 'firebase-admin'
// const FieldValue = admin.firestore.FieldValue
const COLLECTION_NAME = 'users';
class UserRepository {
    constructor(db) {
        this.db = db;
    }
    listUsers(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = Object.assign({}, qs);
            const page = filter.page ? parseInt(filter.page, 10) : 1;
            const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
            const start = (page - 1) * pageSize;
            delete filter.page; // ignore "page" querystring parm
            delete filter.pageSize; // ignore "page" querystring parm
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            if (filter) {
                for (const filterParm in filter) {
                    if (Array.isArray(filter[filterParm])) {
                        const filterValues = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues);
                    }
                    else {
                        const filterValue = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue);
                    }
                }
            }
            const entityCollectionRefs = yield entityRefCollection.offset(start).limit(pageSize).get();
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
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
    lookupUserByUserName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME).where('username', '==', username);
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
    lookupUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME).where('email', '==', email);
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
    storeUser(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = entity.userId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(userId);
            yield deleters_1.deleteDocument(entityRef);
        });
    }
}
exports.UserRepository = UserRepository;
