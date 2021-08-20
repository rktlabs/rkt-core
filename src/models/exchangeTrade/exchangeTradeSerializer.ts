// import { HALSerializer } from 'hal-serializer'

// export const serialize = (req: any, data: any) => {
//     const baseUrl = req.fantUrls.baseUrl

//     const serializer = new HALSerializer()

//     serializer.register('exchangeTrade', {
//         whitelist: ['tradeAt', 'lastPrice', 'lastTrade'],
//         links: (record: any) => {
//             return {
//                 self: { href: `${baseUrl}/trades/${record.assetId}`, rel: 'exchangeTrade' },
//             }
//         },
//         associations: function (data: any) {
//             return {
//                 asset: {
//                     href: `${req.fantUrls.proto}//${req.fantUrls.host}/assets/${data.assetId}`,
//                     rel: 'asset',
//                     id: data.assetId,
//                 },
//             }
//         },
//     })

//     const serialized = serializer.serialize('exchangeTrade', data)
//     return serialized
// }

// export const serializeCollection = (req: any, data: any) => {
//     const baseUrl = req.fantUrls.baseUrl
//     const selfUrl = req.fantUrls.selfUrl
//     const proto = req.fantUrls.proto
//     const host = req.fantUrls.host

//     const total = data.length

//     let page = parseInt(req.query.page || '1', 10)
//     if (page <= 1) {
//         page = 1
//     }

//     const pageSize = 25
//     const pages = Math.floor((total - 1) / pageSize) + 1
//     const start = (page - 1) * pageSize
//     const displayData = data.slice(start, start + pageSize)
//     const displayCount = displayData.length

//     const collectionLinks: any = {
//         self: { href: `${selfUrl}`, rel: 'collection:exchangeTrades' },
//     }

//     if (total > pageSize) {
//         collectionLinks.first = {
//             href: `${baseUrl}/trades`,
//         }
//         if (page > 1) {
//             collectionLinks.prev = {
//                 href: `${baseUrl}/trades?page=${page - 1}`,
//             }
//         }
//         if (page < pages) {
//             collectionLinks.next = {
//                 href: `${baseUrl}/trades?page=${page + 1}`,
//             }
//         }
//         if (page <= pages) {
//             collectionLinks.last = {
//                 href: `${baseUrl}/trades?page=${pages}`,
//             }
//         }
//     }

//     const serializer = new HALSerializer()

//     serializer.register('exchangeTrades', {
//         // whitelist: ['type', 'exchangeTradeId', 'portfolioId', 'displayName'],
//         links: (record: any) => {
//             return {
//                 self: `${proto}//${host}/exchange/trades/${record.assetId}`,
//             }
//         },
//         topLevelLinks: collectionLinks,
//         topLevelMeta: (extraOptions: any) => {
//             return {
//                 page: extraOptions.page,
//                 pageSize: extraOptions.pageSize,
//                 pages: extraOptions.pages,
//                 count: extraOptions.count,
//                 total: extraOptions.total,
//             }
//         },
//     })

//     const serialized = serializer.serialize('exchangeTrades', displayData, {
//         page,
//         pageSize,
//         pages,
//         count: displayCount,
//         total,
//     })
//     return serialized
// }
