"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCollection = exports.serialize = void 0;
const hal_serializer_1 = require("hal-serializer");
const serialize = (selfUrl, baseUrl, data) => {
    const serializer = new hal_serializer_1.HALSerializer();
    serializer.register('maker', {
        whitelist: ['createdAt', 'type', 'makerId', 'symbol', 'ownerId', 'displayName', 'bid', 'ask', 'last'],
        links: () => {
            return {
                league: {
                    //href: `${baseUrl}/leagues/${data.leagueId}`, // TODO: change to leagueId
                    //id: data.leagueId,
                    // title: data.leagueDisplayName,
                    href: `${baseUrl}/leagues/${data.contractId}`,
                    rel: 'league',
                    id: data.contractId,
                    title: data.contractDisplayName,
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
                maker: {
                    href: `${baseUrl}/makers/${data.makerId}`,
                    rel: 'maker',
                    id: data.makerId,
                },
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
        self: { href: `${selfUrl}`, rel: 'collection:makers' },
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
        whitelist: ['type', 'makerId', 'symbol', 'displayName', 'bid', 'ask', 'last'],
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
                // pages: extraOptions.pages,
                // total: extraOptions.total,
            };
        },
    });
    const serialized = serializer.serialize('makers', data, {
        page,
        pageSize,
        count: displayCount,
        // pages: pages,
        // total: rowcount,
    });
    return serialized;
};
exports.serializeCollection = serializeCollection;