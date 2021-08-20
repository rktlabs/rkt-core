"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (req, portfolioId, data) => {
    const proto = req.fantUrls.proto;
    const host = req.fantUrls.host;
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('order', {
        whitelist: [
            'orderId',
            'createdAt',
            'portfolioId',
            'assetId',
            'orderType',
            'orderSide',
            'orderSize',
            'state',
            'status',
            'filledValue',
            'filledPrice',
            'filledSize',
            'orderSizeRemaining',
            'events',
        ],
        links: (record) => {
            return {
                self: { href: `${proto}//${host}/portfolios/${portfolioId}/orders`, rel: 'order' },
                portfolio: { href: `${proto}//${host}/portfolios/${record.portfolioId}`, rel: 'portfolio' },
                asset: { href: `${proto}//${host}/assets/${record.assetId}`, rel: 'asset' },
            };
        },
    });
    const serialized = serializer.serialize('order', data);
    return serialized;
};
exports.serialize = serialize;
const serializeCollection = (req, portfolioId, data) => {
    const proto = req.fantUrls.proto;
    const host = req.fantUrls.host;
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
        self: { href: `${selfUrl}`, rel: 'collection:assets' },
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
    serializer.register('orders', {
        whitelist: ['orderId', 'createdAt', 'assetId', 'orderType', 'orderSide', 'orderSize', 'state', 'status'],
        links: (record) => {
            return {
                self: { href: `${proto}//${host}/portfolios/${portfolioId}/orders/${record.orderId}`, rel: 'order' },
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
    const serialized = serializer.serialize('orders', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;
