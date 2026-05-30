export type Gender = 'male' | 'female' | 'unisex'
export type BodyType = 'slim' | 'standard' | 'athletic' | 'plus'
export type Occasion =
  | 'casual' | 'shopping' | 'cafe'
  | 'date' | 'party' | 'festival'
  | 'outdoor' | 'sport' | 'travel'
  | 'office' | 'formal' | 'wedding'

export type FashionStyle =
  | 'casual' | 'minimal' | 'classic' | 'normcore' | 'natural' | 'clean'
  | 'korean' | 'y2k' | 'cottagecore' | 'dark' | 'old-money' | 'balletcore'
  | 'feminine' | 'romantic' | 'bohemian' | 'luxury' | 'mode'
  | 'sporty' | 'gorpcore' | 'techwear' | 'military' | 'surf'
  | 'street' | 'vintage' | 'preppy' | 'punk' | 'skate' | 'amekaji'
  | 'office' | 'workwear' | 'harajuku'

export type ColorPalette =
  | 'monotone' | 'white' | 'black' | 'gray' | 'navy'
  | 'blue' | 'green' | 'olive' | 'brown' | 'beige'
  | 'red' | 'pink' | 'burgundy' | 'pastel' | 'vivid'

export type FitPreference = 'tight' | 'regular' | 'relaxed' | 'oversized' | 'wide'

export type BodyFrameType = 'straight' | 'wave' | 'natural'

export type ItemCategory = 'トップス' | 'ボトムス' | 'シューズ' | 'アウター' | 'バッグ' | 'アクセサリー'

export interface WardrobeItem {
  id: string
  category: ItemCategory
  name: string
  brand: string
  color: string
  imageColor: string
  note: string
  addedAt: string
  imageDataUrl?: string  // compressed thumbnail stored in localStorage
}

export interface UserProfile {
  gender: Gender
  age: string
  bodyType: BodyType
  height: string
  occasion: Occasion[]
  styles: FashionStyle[]
  budget: 'low' | 'mid' | 'high'
  colors: ColorPalette[]
  fit: FitPreference
  useWardrobe: boolean
  selectedTrends: string[]  // trend IDs
  useWeather: boolean
  bodyFrameType?: BodyFrameType
}

export interface OutfitItem {
  category: ItemCategory
  name: string
  brand: string
  price: number
  description: string
  color: string
  searchQuery: string
  searchUrl: string
  imageColor: string
  isOwned?: boolean   // true = ユーザー所有アイテム（ワードローブから）
}

export interface DayOutfit {
  day: string
  dayEn: string
  theme: string
  mood: string
  items: OutfitItem[]
  stylingTip: string
}

export interface WeeklyOutfitPlan {
  outfits: DayOutfit[]
  overallConcept: string
}

export interface ShopInfo {
  id: string
  ownerId: string
  name: string
  url: string
  description: string
  accentColor: string
  baseAccessToken?: string
  baseRefreshToken?: string
  baseLastSyncAt?: string
  createdAt: string
}

export interface ShopProduct {
  id: string
  shopId: string
  shopName: string
  shopUrl: string
  shopAccentColor: string
  category: ItemCategory
  name: string
  price: number
  color: string
  imageColor: string
  description: string
  productUrl: string
  active: boolean
  source: 'manual' | 'base'
  sourceItemId?: string
  createdAt: string
}
