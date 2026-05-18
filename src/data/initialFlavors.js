/** @type {import('./types').Brand[]} */
export const initialBrands = [
  { id: 'brand-001', name: 'Al Fakher', nameJa: 'アルファーヘル', origin: 'UAE', isCustom: false },
]

/** @type {import('./types').Flavor[]} */
export const initialFlavors = [
  // フルーツ系
  { id: 'flavor-001', brandId: 'brand-001', name: 'Double Apple',  nameJa: 'ダブルアップル',     category: 'フルーツ系', isCustom: false },
  { id: 'flavor-002', brandId: 'brand-001', name: 'Grape',          nameJa: 'グレープ',           category: 'フルーツ系', isCustom: false },
  { id: 'flavor-003', brandId: 'brand-001', name: 'Grape with Mint',nameJa: 'グレープミント',     category: 'フルーツ系', isCustom: false },
  { id: 'flavor-004', brandId: 'brand-001', name: 'Strawberry',     nameJa: 'ストロベリー',       category: 'フルーツ系', isCustom: false },
  { id: 'flavor-005', brandId: 'brand-001', name: 'Blueberry',      nameJa: 'ブルーベリー',       category: 'フルーツ系', isCustom: false },
  { id: 'flavor-006', brandId: 'brand-001', name: 'Watermelon',     nameJa: 'スイカ',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-007', brandId: 'brand-001', name: 'Peach',          nameJa: 'ピーチ',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-008', brandId: 'brand-001', name: 'Lemon',          nameJa: 'レモン',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-009', brandId: 'brand-001', name: 'Lemon with Mint',nameJa: 'レモンミント',       category: 'フルーツ系', isCustom: false },
  { id: 'flavor-010', brandId: 'brand-001', name: 'Orange',         nameJa: 'オレンジ',           category: 'フルーツ系', isCustom: false },
  { id: 'flavor-011', brandId: 'brand-001', name: 'Mango',          nameJa: 'マンゴー',           category: 'フルーツ系', isCustom: false },
  { id: 'flavor-012', brandId: 'brand-001', name: 'Kiwi',           nameJa: 'キウイ',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-013', brandId: 'brand-001', name: 'Guava',          nameJa: 'グアバ',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-014', brandId: 'brand-001', name: 'Melon',          nameJa: 'メロン',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-015', brandId: 'brand-001', name: 'Pomegranate',    nameJa: 'ザクロ',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-016', brandId: 'brand-001', name: 'Pineapple',      nameJa: 'パイナップル',       category: 'フルーツ系', isCustom: false },
  { id: 'flavor-017', brandId: 'brand-001', name: 'Berry',          nameJa: 'ベリー',             category: 'フルーツ系', isCustom: false },
  { id: 'flavor-018', brandId: 'brand-001', name: 'Mixed Fruit',    nameJa: 'ミックスフルーツ',   category: 'フルーツ系', isCustom: false },
  // ミント系
  { id: 'flavor-019', brandId: 'brand-001', name: 'Mint',           nameJa: 'ミント',             category: 'ミント系',   isCustom: false },
  { id: 'flavor-020', brandId: 'brand-001', name: 'Fresh',          nameJa: 'フレッシュ',         category: 'ミント系',   isCustom: false },
  // お菓子・スイーツ系
  { id: 'flavor-021', brandId: 'brand-001', name: 'Gum',            nameJa: 'ガム',               category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-022', brandId: 'brand-001', name: 'Chocolate',      nameJa: 'チョコレート',       category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-023', brandId: 'brand-001', name: 'Vanilla',        nameJa: 'バニラ',             category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-024', brandId: 'brand-001', name: 'Caramel',        nameJa: 'キャラメル',         category: 'お菓子・スイーツ系', isCustom: false },
  // フローラル系
  { id: 'flavor-025', brandId: 'brand-001', name: 'Rose',           nameJa: 'ローズ',             category: 'フローラル系', isCustom: false },
  { id: 'flavor-026', brandId: 'brand-001', name: 'Jasmine',        nameJa: 'ジャスミン',         category: 'フローラル系', isCustom: false },
  // ドリンク系
  { id: 'flavor-027', brandId: 'brand-001', name: 'Cola',           nameJa: 'コーラ',             category: 'ドリンク系', isCustom: false },
  { id: 'flavor-028', brandId: 'brand-001', name: 'Coffee',         nameJa: 'コーヒー',           category: 'ドリンク系', isCustom: false },
  // 変わり種
  { id: 'flavor-029', brandId: 'brand-001', name: 'Magic Love',       nameJa: 'マジックラブ',         category: '変わり種', isCustom: false },
  { id: 'flavor-030', brandId: 'brand-001', name: 'Dream Magic Love', nameJa: 'ドリームマジックラブ', category: '変わり種', isCustom: false },
]
