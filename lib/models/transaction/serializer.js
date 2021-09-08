"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (selfUrl, baseUrl, data) => {
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('transactionLeg', {
        whitelist: ['cost', 'units'],
        links: function (data) {
            return {
                asset: {
                    href: `${baseUrl}/assets/${data.assetId}`,
                    rel: 'asset',
                    id: data.assetId,
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            };
        },
    });
    serializer.register('transaction', {
        whitelist: ['createdAt', 'transactionId', 'status', 'inputs', 'outputs', 'xids', 'tags'],
        links: (record) => {
            return {
                self: { href: `${baseUrl}/${record.transactionId}`, rel: 'transaction' },
            };
        },
        embedded: {
            inputs: {
                type: 'transactionLeg',
            },
            outputs: {
                type: 'transactionLeg',
            },
        },
    });
    const serialized = serializer.serialize('transaction', data);
    return serialized;
};
exports.serialize = serialize;
const serializeCollection = (selfUrl, baseUrl, qs, data /* , rowcount: number */) => {
    const filter = Object.assign({}, qs);
    const page = filter.page ? parseInt(filter.page, 10) : 1;
    const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
    delete filter.page; // ignore "page" querystring parm
    delete filter.pageSize; // ignore "page" querystring parm
    //const pages = Math.floor((rowcount - 1) / pageSize) + 1
    const newFilter = [];
    for (const v in filter) {
        if (filter.hasOwnProperty(v)) {
            newFilter.push(encodeURIComponent(v) + '=' + encodeURIComponent(filter[v]));
        }
    }
    const linkQS = newFilter && newFilter.length > 0 ? newFilter.join('&') + '&' : '';
    const recordCount = data.length;
    const hasMore = recordCount === pageSize;
    const displayCount = data.length;
    const collectionLinks = {
        self: { href: `${selfUrl}`, rel: 'collection:assets' },
    };
    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}/transactions?${linkQS}page=1&pageSize=${pageSize}`,
        };
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/transactions?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            };
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/transactions?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            };
        }
    }
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('transactions', {
        whitelist: ['transactionId', 'inputs', 'outputs'],
        links: (record) => {
            return {
                self: { href: `${baseUrl}/transactions/${record.transactionId}`, rel: 'transaction' },
            };
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                count: extraOptions.count,
            };
        },
    });
    const serialized = serializer.serialize('transactions', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;
