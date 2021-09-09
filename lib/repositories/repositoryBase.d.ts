export declare class RepositoryBase {
    generatePagingProperties(qs: any, entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, orderBy?: string | null): FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
    generateFilterPredicate(qs: any, filterMap: any, entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>): FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
}
