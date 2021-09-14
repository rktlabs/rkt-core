"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (selfUrl, baseUrl, data) => {
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('maker', {
        //whitelist: ['bid', 'ask', 'last', 'params'],
        links: (record) => {
            return {
                self: {
                    href: `${selfUrl}`,
                    rel: 'maker',
                },
                asset: {
                    href: `${baseUrl}/assets/${record.assetId}`,
                    rel: 'asset',
                    id: record.assetId,
                },
                // portfolio: {
                //     href: `${baseUrl}/portfolios/${data.portfolioId}`,
                //     rel: 'portfolio',
                //     id: data.portfolioId,
                // },
            };
        },
    });
    const serialized = serializer.serialize('maker', data);
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
            href: `${baseUrl}/makers?${linkQS}page=1&pageSize=${pageSize}`,
        };
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/makers?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            };
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/makers?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            };
        }
        // if (page <= pages) {
        //     collectionLinks.last = {
        //         href: `${baseUrl}/makers?${linkQS}page=${pages}`,
        //     }
        // }
    }
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('makers', {
        //whitelist: ['bid', 'ask', 'last', 'params'],
        links: (record) => {
            return {
                self: {
                    href: `${baseUrl}/makers/${record.makerId}`,
                    rel: 'maker',
                },
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
    const serialized = serializer.serialize('makers', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;
