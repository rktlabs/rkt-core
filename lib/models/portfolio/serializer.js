"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (selfUrl, baseUrl, data) => {
    // const baseUrl = req.fantUrls.baseUrl
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('portfolio', {
        whitelist: ['type', 'name', 'displayName', 'ownerId', 'createdAt'],
        links: (record) => {
            return {
                self: { href: `${selfUrl}`, rel: 'portfolio' },
                holdings: { href: `${baseUrl}/${record.portfolioId}/holdings`, rel: 'holdings' },
                activity: { href: `${baseUrl}/${record.portfolioId}/activity`, rel: 'activity' },
                // orders: { href: `${baseUrl}/${record.portfolioId}/orders`, rel: 'orders' },
            };
        },
        // associations: function (data: any) {
        //     return {
        //         portfolio: {  // TODO: What is this?????
        //             href: `${baseUrl}/portfolios/${data.portfolioId}`,
        //             rel: 'portfolio',
        //             id: data.portfolioId,
        //         },
        //     }
        // },
    });
    const serialized = serializer.serialize('portfolio', data);
    return serialized;
};
exports.serialize = serialize;
const serializeCollection = (selfUrl, baseUrl, qs, data) => {
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
        self: { href: `${selfUrl}`, rel: 'collection:portfolios' },
    };
    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}/portfolios?${linkQS}page=1&pageSize=${pageSize}`,
        };
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/portfolios?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            };
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/portfolios?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            };
        }
    }
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('portfolios', {
        whitelist: ['type', 'portfolioId', 'displayName'],
        links: (record) => {
            return {
                self: { href: `${baseUrl}/portfolios/${record.portfolioId}`, rel: 'portfolio' },
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
    const serialized = serializer.serialize('portfolios', data, {
        page,
        pageSize,
        count: displayCount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;