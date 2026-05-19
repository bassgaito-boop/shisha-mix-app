import rawDb from './shisha_flavor_db.json'

/** @type {import('./types').Brand[]} */
export const initialBrands = rawDb.map((entry) => entry.brand)

/** @type {import('./types').Flavor[]} */
export const initialFlavors = rawDb.flatMap((entry) => entry.flavors)
