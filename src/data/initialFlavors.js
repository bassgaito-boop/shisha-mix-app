/** @type {import('./types').Brand[]} */
export const initialBrands = [
  { id: 'brand-001', name: 'Al Fakher', nameJa: 'アルファーヘル', origin: 'UAE',   isCustom: false },
  { id: 'brand-002', name: 'DOZAJ',     nameJa: 'ドザジ',         origin: 'トルコ', isCustom: false },
  { id: 'brand-003', name: 'Fumari',    nameJa: 'フマリ',         origin: 'USA',   isCustom: false },
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

  // ── DOZAJ ──────────────────────────────────────────────────────────────
  // フルーツ系
  { id: 'flavor-031', brandId: 'brand-002', name: 'Magic Smoke',         nameJa: 'マジックスモーク',         category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-032', brandId: 'brand-002', name: 'Lemon',               nameJa: 'レモン',                   category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-033', brandId: 'brand-002', name: 'Peach',               nameJa: 'ピーチ',                   category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-034', brandId: 'brand-002', name: 'Mango',               nameJa: 'マンゴー',                 category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-035', brandId: 'brand-002', name: 'Kiwi',                nameJa: 'キウイ',                   category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-036', brandId: 'brand-002', name: 'Orange',              nameJa: 'オレンジ',                 category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-037', brandId: 'brand-002', name: 'Pineapple',           nameJa: 'パイナップル',             category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-038', brandId: 'brand-002', name: 'Dragon Fruits',       nameJa: 'ドラゴンフルーツ',         category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-039', brandId: 'brand-002', name: 'Pomegranate Yogurt',  nameJa: 'ポムグランテヨーグルト',   category: 'フルーツ系',         isCustom: false },
  // ミント系
  { id: 'flavor-040', brandId: 'brand-002', name: 'Ice Mint',            nameJa: 'アイスミント',             category: 'ミント系',           isCustom: false },
  // お菓子・スイーツ系
  { id: 'flavor-041', brandId: 'brand-002', name: 'Caramel',             nameJa: 'キャラメル',               category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-042', brandId: 'brand-002', name: 'Vanilla',             nameJa: 'バニラ',                   category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-043', brandId: 'brand-002', name: 'Yogurt',              nameJa: 'ヨーグルト',               category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-044', brandId: 'brand-002', name: 'Chocolate Cereal',    nameJa: 'チョコレートシリアル',     category: 'お菓子・スイーツ系', isCustom: false },
  // ドリンク系
  { id: 'flavor-045', brandId: 'brand-002', name: 'Cola',                nameJa: 'コーラ',                   category: 'ドリンク系',         isCustom: false },
  { id: 'flavor-046', brandId: 'brand-002', name: 'Green Tea',           nameJa: 'グリーンティー',           category: 'ドリンク系',         isCustom: false },
  { id: 'flavor-047', brandId: 'brand-002', name: 'Bergamot Tea',        nameJa: 'ベルガモットティー',       category: 'ドリンク系',         isCustom: false },
  // ナッツ系
  { id: 'flavor-048', brandId: 'brand-002', name: 'Pistachio',           nameJa: 'ピスタチオ',               category: 'ナッツ系',           isCustom: false },
  { id: 'flavor-049', brandId: 'brand-002', name: 'Sesame',              nameJa: 'セサミ',                   category: 'ナッツ系',           isCustom: false },
  // 変わり種
  { id: 'flavor-050', brandId: 'brand-002', name: 'Dead Sea',            nameJa: 'デッドシー',               category: '変わり種',           isCustom: false },

  // ── Fumari ─────────────────────────────────────────────────────────────
  // フルーツ系
  { id: 'flavor-051', brandId: 'brand-003', name: 'White Peach',         nameJa: 'ホワイトピーチ',           category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-052', brandId: 'brand-003', name: 'Blueberry Muffin',    nameJa: 'ブルーベリーマフィン',     category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-053', brandId: 'brand-003', name: 'Lychee',              nameJa: 'ライチ',                   category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-054', brandId: 'brand-003', name: 'Watermelon Mint',     nameJa: 'スイカミント',             category: 'フルーツ系',         isCustom: false },
  { id: 'flavor-055', brandId: 'brand-003', name: 'Strawberry Daiquiri', nameJa: 'ストロベリーダイキリ',     category: 'フルーツ系',         isCustom: false },
  // ミント系
  { id: 'flavor-056', brandId: 'brand-003', name: 'Mint',                nameJa: 'ミント',                   category: 'ミント系',           isCustom: false },
  { id: 'flavor-057', brandId: 'brand-003', name: 'Spiced Chai',         nameJa: 'スパイスチャイ',           category: 'ミント系',           isCustom: false },
  // お菓子・スイーツ系
  { id: 'flavor-058', brandId: 'brand-003', name: 'Gummy Bear',          nameJa: 'グミベア',                 category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-059', brandId: 'brand-003', name: 'White Gummy Bear',    nameJa: 'ホワイトグミベア',         category: 'お菓子・スイーツ系', isCustom: false },
  { id: 'flavor-060', brandId: 'brand-003', name: 'Ambrosia',            nameJa: 'アンブロシア',             category: 'お菓子・スイーツ系', isCustom: false },
  // ドリンク系
  { id: 'flavor-061', brandId: 'brand-003', name: 'Lemon Grass',         nameJa: 'レモングラス',             category: 'ドリンク系',         isCustom: false },
  { id: 'flavor-062', brandId: 'brand-003', name: 'Mango Tango',         nameJa: 'マンゴータンゴ',           category: 'ドリンク系',         isCustom: false },
  // 変わり種
  { id: 'flavor-063', brandId: 'brand-003', name: 'Cosmo',               nameJa: 'コスモポリタン',           category: '変わり種',           isCustom: false },
  { id: 'flavor-064', brandId: 'brand-003', name: 'Tangelo',             nameJa: 'タンジェロ',               category: '変わり種',           isCustom: false },
  { id: 'flavor-065', brandId: 'brand-003', name: 'Pina Colada',         nameJa: 'ピニャコラーダ',           category: '変わり種',           isCustom: false },
]
