export type TAssetHolder = {
    assetId: string
    portfolioId: string
    units: number
}

export type TAssetHolderPatch = {
    units?: number
}
