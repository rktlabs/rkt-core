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
exports.deleteCollection = exports.deleteDocument = void 0;
const deleteDocument = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    const collections = yield ref.listCollections();
    const promises = [];
    collections.forEach((collection) => promises.push(exports.deleteCollection(collection)));
    yield Promise.all(promises);
    yield ref.delete();
});
exports.deleteDocument = deleteDocument;
const deleteCollection = (collectionRef) => __awaiter(void 0, void 0, void 0, function* () {
    const docs = yield collectionRef.listDocuments();
    const promises = [];
    docs.forEach((doc) => {
        promises.push(exports.deleteDocument(doc));
    });
    yield Promise.all(promises);
});
exports.deleteCollection = deleteCollection;
