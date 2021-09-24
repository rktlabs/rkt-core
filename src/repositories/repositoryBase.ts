'use strict'

export class RepositoryBase {
    generatePagingProperties(
        qs: any,
        entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
        orderBy: string | null = null,
    ) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize

        if (orderBy) {
            entityRefCollection = entityRefCollection.orderBy(orderBy)
        }

        entityRefCollection = entityRefCollection.offset(start).limit(pageSize)

        return entityRefCollection
    }

    generateFilterPredicate(
        qs: any,
        filterMap: any,
        entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
    ) {
        const filter = Object.assign({}, qs)
        delete filter.pageSize
        delete filter.page

        for (const filterParm in filter) {
            const mappedColumn = filterMap[filterParm]
            if (mappedColumn) {
                if (Array.isArray(filter[filterParm])) {
                    const filterValues = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues)
                } else {
                    const filterValue = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue)
                }
            } else {
                console.log(`********* INVALID FILTER: ${filterParm}`)
            }
        }

        return entityRefCollection
    }
}
