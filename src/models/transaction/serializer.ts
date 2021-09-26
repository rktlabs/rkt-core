'use strict'

import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, baseUrl: string, data: any) => {
    const serializer = new HALSerializer()

    serializer.register('transactionLeg', {
        whitelist: ['units'],
        links: (record: any) => {
            return {
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
            }
        },
    })

    serializer.register('transaction', {
        whitelist: ['createdAt', 'transactionId', 'status', 'inputs', 'outputs', 'xids', 'tags'],
        links: (record: any) => {
            return {
                self: {
                    href: `${baseUrl}/${record.transactionId}`,
                    rel: 'transaction',
                },
            }
        },
        embedded: {
            inputs: {
                type: 'transactionLeg',
            },
            outputs: {
                type: 'transactionLeg',
            },
        },
    })

    const serialized = serializer.serialize('transaction', data)
    return serialized
}

export const serializeCollection = (selfUrl: string, baseUrl: string, qs: any, data: any /* , rowcount: number */) => {
    const filter = Object.assign({}, qs)
    const page = filter.page ? parseInt(filter.page, 10) : 1
    const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
    delete filter.page // ignore "page" querystring parm
    delete filter.pageSize // ignore "page" querystring parm

    const newFilter = []
    for (const v in filter) {
        if (filter.hasOwnProperty(v)) {
            newFilter.push(encodeURIComponent(v) + '=' + encodeURIComponent(filter[v]))
        }
    }
    const linkQS = newFilter && newFilter.length > 0 ? newFilter.join('&') + '&' : ''

    const recordCount = data.length
    const hasMore = recordCount === pageSize
    const displayCount = data.length

    const collectionLinks: any = {
        self: {
            href: `${selfUrl}`,
            rel: 'collection:assets',
        },
    }

    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}/transactions?${linkQS}page=1&pageSize=${pageSize}`,
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/transactions?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/transactions?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('transactions', {
        whitelist: ['transactionId', 'inputs', 'outputs'],
        links: (record: any) => {
            return {
                self: {
                    href: `${baseUrl}/transactions/${record.transactionId}`,
                    rel: 'transaction',
                },
            }
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions: any) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                count: extraOptions.count,
            }
        },
    })

    const serialized = serializer.serialize('transactions', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
