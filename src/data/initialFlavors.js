import rawDb from './flavorDb.json'

/** @type {import('./types').Brand[]} */
export const initialBrands = rawDb.map((entry) => entry.brand)

/** @type {import('./types').Flavor[]} */
export const initialFlavors = rawDb.flatMap((entry) => entry.flavors)
