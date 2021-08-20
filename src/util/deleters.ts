export const deleteDocument = async (ref: any) => {
    const collections = await ref.listCollections()
    const promises: any[] = []
    collections.forEach((collection: any) => promises.push(deleteCollection(collection)))
    await Promise.all(promises)
    await ref.delete()
}

export const deleteCollection = async (collectionRef: any) => {
    const docs = await collectionRef.listDocuments()
    const promises: any[] = []
    docs.forEach((doc: any) => {
        promises.push(deleteDocument(doc))
    })
    await Promise.all(promises)
}
