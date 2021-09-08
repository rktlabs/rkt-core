export class RepositoryBase {
    // generatePagingProperties(qs: any) {
    //     const filter = Object.assign({}, qs)
    //     const page = filter.page ? parseInt(filter.page, 10) : 1
    //     const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
    //     const start = (page - 1) * pageSize
    //     const pagingProperties = ` order by id offset ${start} limit ${pageSize} `
    //     return pagingProperties
    // }

    generateFilterPredicate(
        qs: any,
        filterMap: any,
        entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
    ) {
        const filter = Object.assign({}, qs)

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
            }
        }

        return entityRefCollection
    }
}