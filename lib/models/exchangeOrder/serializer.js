"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (selfUrl, baseUrl, data) => {
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('exchangeOrder', {
        whitelist: [
            //'portfolioId',
            'orderId',
            //'assetId',
            'createdAt',
            'type',
            'orderSide',
            'size',
            'state',
            'status',
            'executedAt',
            'filledSize',
            'filledValue',
            'filledPrice',
            'sizeRemaining',
        ],
        links: (record) => {
            return {
                self: {
                    href: `${selfUrl}`,
                    rel: 'exchangeOrder',
                },
                asset: {
                    href: `${baseUrl}/assets/${record.assetId}`,
                    rel: 'asset',
                    id: record.assetId,
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${record.portfolioId}`,
                    rel: 'portfolio',
                    id: record.portfolioId,
                },
            };
        },
    });
    const serialized = serializer.serialize('exchangeOrder', data);
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
            href: `${baseUrl}/exchange/orders?${linkQS}page=1&pageSize=${pageSize}`,
        };
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/exchange/orders?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            };
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/exchange/orders?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            };
        }
    }
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('exchangeOrders', {
        whitelist: [
            'type',
            'orderSide',
            'size',
            'assetId',
            'portfolioId',
            'orderId',
            'createdAt',
            'executedAt',
            'state',
            'status',
        ],
        links: (record) => {
            return {
                self: {
                    href: `${baseUrl}/exchange/orders/${record.portfolioId}%23${record.orderId}`,
                    rel: 'collection:exchangeOrders',
                },
            };
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                pages: extraOptions.pages,
                count: extraOptions.count,
                total: extraOptions.total,
            };
        },
    });
    const serialized = serializer.serialize('exchangeOrders', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;
