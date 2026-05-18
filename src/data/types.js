/**
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} name
 * @property {string} nameJa
 * @property {string} origin
 * @property {boolean} isCustom
 */

/**
 * @typedef {Object} Flavor
 * @property {string} id
 * @property {string} brandId
 * @property {string} name
 * @property {string} nameJa
 * @property {string} category
 * @property {boolean} isCustom
 */

/**
 * レシピ内の1フレーバー
 * @typedef {Object} FlavorItem
 * @property {string} brandId
 * @property {string} flavorId
 * @property {number} grams
 */

/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} name
 * @property {FlavorItem[]} flavors
 * @property {number} totalGrams          - 自動計算
 * @property {string[]} ratios            - 各フレーバーの割合（例: "60%"）、自動計算
 * @property {string} tastingNote
 * @property {string[]} tags
 * @property {string|null} settingId
 * @property {number} rating              - 1〜5
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Setting
 * @property {string} id
 * @property {string} name
 * @property {string} bowlType
 * @property {string} stemType
 * @property {string} charcoalType
 * @property {number} charcoalCount
 * @property {string} note
 * @property {string} createdAt
 * @property {string} updatedAt
 */
