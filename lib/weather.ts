export type WeatherCondition =
  | 'sunny' | 'partly-cloudy' | 'cloudy' | 'foggy'
  | 'drizzle' | 'rain' | 'heavy-rain' | 'snow' | 'thunderstorm'

export interface WeatherDay {
  date: string           // YYYY-MM-DD
  condition: WeatherCondition
  conditionJa: string
  tempMax: number
  tempMin: number
  precipProb: number     // 0-100
  windspeed: number      // km/h
  outfitAdvice: string   // styling tip for this weather
  icon: string           // emoji
}

export interface WeatherData {
  city: string
  lat: number
  lon: number
  timezone: string
  days: WeatherDay[]
}

// WMO Weather Code → condition
const WMO_MAP: Record<number, { condition: WeatherCondition; ja: string; icon: string }> = {
  0:  { condition: 'sunny',          ja: '快晴',       icon: '☀️' },
  1:  { condition: 'sunny',          ja: '晴れ',       icon: '🌤️' },
  2:  { condition: 'partly-cloudy',  ja: '晴れ時々曇り', icon: '⛅' },
  3:  { condition: 'cloudy',         ja: '曇り',       icon: '☁️' },
  45: { condition: 'foggy',          ja: '霧',         icon: '🌫️' },
  48: { condition: 'foggy',          ja: '濃霧',       icon: '🌫️' },
  51: { condition: 'drizzle',        ja: '小雨',       icon: '🌦️' },
  53: { condition: 'drizzle',        ja: '霧雨',       icon: '🌦️' },
  55: { condition: 'drizzle',        ja: '霧雨（強）',  icon: '🌦️' },
  61: { condition: 'rain',           ja: '雨',         icon: '🌧️' },
  63: { condition: 'rain',           ja: '雨（中）',   icon: '🌧️' },
  65: { condition: 'heavy-rain',     ja: '大雨',       icon: '🌧️' },
  71: { condition: 'snow',           ja: '雪',         icon: '🌨️' },
  73: { condition: 'snow',           ja: '雪（中）',   icon: '❄️' },
  75: { condition: 'snow',           ja: '大雪',       icon: '❄️' },
  77: { condition: 'snow',           ja: '霰',         icon: '🌨️' },
  80: { condition: 'rain',           ja: 'にわか雨',   icon: '🌦️' },
  81: { condition: 'rain',           ja: '雨（強）',   icon: '🌧️' },
  82: { condition: 'heavy-rain',     ja: '豪雨',       icon: '⛈️' },
  85: { condition: 'snow',           ja: 'にわか雪',   icon: '🌨️' },
  86: { condition: 'snow',           ja: '大雪（強）', icon: '❄️' },
  95: { condition: 'thunderstorm',   ja: '雷雨',       icon: '⛈️' },
  96: { condition: 'thunderstorm',   ja: '雷雨（強）', icon: '⛈️' },
  99: { condition: 'thunderstorm',   ja: '激しい雷雨', icon: '⛈️' },
}

function getWmo(code: number) {
  return WMO_MAP[code] ?? { condition: 'cloudy' as WeatherCondition, ja: '曇り', icon: '☁️' }
}

function getOutfitAdvice(condition: WeatherCondition, tempMax: number, tempMin: number): string {
  const avg = (tempMax + tempMin) / 2

  if (condition === 'snow') {
    return '防水ブーツ＋厚手コートで完全防備。傘は必携です'
  }
  if (condition === 'heavy-rain' || condition === 'thunderstorm') {
    return '防水素材のアウター＋レインブーツが必須。バッグも防水を'
  }
  if (condition === 'rain' || condition === 'drizzle') {
    return '折りたたみ傘を忘れずに。速乾素材のコーデがおすすめ'
  }
  if (condition === 'foggy') {
    return '気温差に注意。脱ぎ着しやすいレイヤードスタイルが◎'
  }

  if (avg >= 28) return '薄手・通気性重視。リネンやコットンで涼しく'
  if (avg >= 23) return '半袖メインに薄手の羽織で日焼け・冷房対策を'
  if (avg >= 18) return '長袖＋軽めのアウターがちょうど良い季節感'
  if (avg >= 12) return 'ニット＋ジャケットなどの重ね着でおしゃれに防寒'
  if (avg >= 6)  return 'コートは必須。インナーも厚手のものをチョイス'
  return '防寒最優先。マフラー・手袋まで含めたフル装備を'
}

export async function searchCity(name: string): Promise<{ name: string; lat: number; lon: number; country: string }[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=ja&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('都市検索に失敗しました')
  const data = await res.json()
  if (!data.results) return []
  return data.results.map((r: { name: string; latitude: number; longitude: number; country: string }) => ({
    name: r.name,
    lat: r.latitude,
    lon: r.longitude,
    country: r.country,
  }))
}

export async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'windspeed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('天気の取得に失敗しました')
  const data = await res.json()

  const daily = data.daily
  const days: WeatherDay[] = daily.time.map((date: string, i: number) => {
    const wmo = getWmo(daily.weathercode[i])
    const tempMax = Math.round(daily.temperature_2m_max[i])
    const tempMin = Math.round(daily.temperature_2m_min[i])
    return {
      date,
      condition: wmo.condition,
      conditionJa: wmo.ja,
      tempMax,
      tempMin,
      precipProb: daily.precipitation_probability_max[i] ?? 0,
      windspeed: Math.round(daily.windspeed_10m_max[i]),
      outfitAdvice: getOutfitAdvice(wmo.condition, tempMax, tempMin),
      icon: wmo.icon,
    }
  })

  return { city, lat, lon, timezone: data.timezone, days }
}
