"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (req, data) => {
    const baseUrl = req.fantUrls.baseUrl;
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('user', {
        whitelist: ['createdAt', 'userId', 'id', 'username', 'email', 'name', 'displayName', 'referrerId', 'isNew'],
        links: (record) => {
            return {
                self: { href: `${baseUrl}/${record.userId}`, rel: 'user' },
            };
        },
        associations: function (data) {
            return {
                portfolio: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            };
        },
    });
    const serialized = serializer.serialize('user', data);
    return serialized;
};
exports.serialize = serialize;
const serializeCollection = (req, data) => {
    const baseUrl = req.fantUrls.baseUrl;
    const selfUrl = req.fantUrls.selfUrl;
    const recordCount = data.length;
    let page = parseInt(req.query.page || '1', 10);
    if (page <= 1) {
        page = 1;
    }
    const pageSize = Math.min(parseInt(req.query.pageSize || '25', 10), 1000);
    const hasMore = recordCount === pageSize;
    const displayCount = data.length;
    const collectionLinks = {
        self: { href: `${selfUrl}`, rel: 'collection:users' },
    };
    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}?page=1&pageSize=${pageSize}`,
        };
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}?page=${page - 1}&pageSize=${pageSize}`,
            };
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}?page=${page + 1}&pageSize=${pageSize}`,
            };
        }
    }
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('users', {
        whitelist: ['createdAt', 'userId', 'id', 'username', 'email', 'name', 'displayName', 'referrerId', 'isNew'],
        links: (record) => {
            return {
                self: { href: `${baseUrl}/${record.userId}`, rel: 'user' },
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
    const serialized = serializer.serialize('users', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;
