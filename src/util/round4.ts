export const round4 = (num: number) => {
    return Math.round((num + Number.EPSILON) * 10000) / 10000
}
