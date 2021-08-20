import { nanoid, customAlphabet } from 'nanoid'
export const ALPHABET = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789' // remove 0, 1, O, Q, I
export const LENGTH = 8
export const generateId = customAlphabet(ALPHABET, LENGTH)
export const generateNonce = nanoid
