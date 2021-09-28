'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBase = void 0;
const log4js = require("log4js");
const logger = log4js.getLogger('leagueFactory');
class RepositoryBase {
    generatePagingProperties(qs, entityRefCollection, orderBy = null) {
        const filter = Object.assign({}, qs);
        const page = filter.page ? parseInt(filter.page, 10) : 1;
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
        const start = (page - 1) * pageSize;
        if (orderBy) {
            entityRefCollection = entityRefCollection.orderBy(orderBy);
        }
        entityRefCollection = entityRefCollection.offset(start).limit(pageSize);
        return entityRefCollection;
    }
    generateFilterPredicate(qs, filterMap, entityRefCollection) {
        const filter = Object.assign({}, qs);
        delete filter.pageSize;
        delete filter.page;
        for (const filterParm in filter) {
            const mappedColumn = filterMap[filterParm];
            if (mappedColumn) {
                if (Array.isArray(filter[filterParm])) {
                    const filterValues = filter[filterParm];
                    entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues);
                }
                else {
                    const filterValue = filter[filterParm];
                    entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue);
                }
            }
            else {
                logger.error(`********* INVALID FILTER: ${filterParm}`);
            }
        }
        return entityRefCollection;
    }
}
exports.RepositoryBase = RepositoryBase;
