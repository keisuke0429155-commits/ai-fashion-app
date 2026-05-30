'use client'

import { useState, useRef, useEffect } from 'react'
import { WeatherData, WeatherDay, searchCity, fetchWeather } from '@/lib/weather'

interface Props {
  weatherData: WeatherData | null
  useWeather: boolean
  onToggleUse: (v: boolean) => void
  onWeatherChange: (data: WeatherData | null) => void
}

const PRESET_CITIES = [
  { name: '東京',    lat: 35.6895,  lon: 139.6917 },
  { name: '大阪',    lat: 34.6937,  lon: 135.5022 },
  { name: '名古屋',  lat: 35.1815,  lon: 136.9066 },
  { name: '福岡',    lat: 33.5903,  lon: 130.4017 },
  { name: '札幌',    lat: 43.0618,  lon: 141.3545 },
  { name: '仙台',    lat: 38.2682,  lon: 140.8694 },
  { name: '京都',    lat: 35.0116,  lon: 135.7681 },
  { name: '神戸',    lat: 34.6913,  lon: 135.1830 },
]

const CONDITION_COLORS: Record<string, string> = {
  'sunny':         '#FCD34D',
  'partly-cloudy': '#93C5FD',
  'cloudy':        '#9CA3AF',
  'foggy':         '#D1D5DB',
  'drizzle':       '#60A5FA',
  'rain':          '#3B82F6',
  'heavy-rain':    '#1D4ED8',
  'snow':          '#BAE6FD',
  'thunderstorm':  '#7C3AED',
}

function WeatherIcon({ condition, size = 20 }: { condition: string; size?: number }) {
  const style = { fontSize: size }
  const map: Record<string, string> = {
    'sunny': '☀️', 'partly-cloudy': '⛅', 'cloudy': '☁️',
    'foggy': '🌫️', 'drizzle': '🌦️', 'rain': '🌧️',
    'heavy-rain': '⛈️', 'snow': '❄️', 'thunderstorm': '⛈️',
  }
  return <span style={style}>{map[condition] ?? '🌤️'}</span>
}

export default function WeatherWidget({ weatherData, useWeather, onToggleUse, onWeatherChange }: Props) {
  const [open, setOpen]         = useState(true)
  const [query, setQuery]       = useState('')
  const [suggestions, setSugg]  = useState<{ name: string; lat: number; lon: number; country: string }[]>([])
  const [loading, setLoading]   = useState(false)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [showSugg, setShowSugg] = useState(false)
  const suggRef                 = useRef<HTMLDivElement>(null)
  const searchTimer             = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggRef.current && !suggRef.current.contains(e.target as Node)) {
        setShowSugg(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleQueryChange = (v: string) => {
    setQuery(v)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (v.length < 1) { setSugg([]); setShowSugg(false); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchCity(v)
        setSugg(results)
        setShowSugg(results.length > 0)
      } catch {
        setSugg([])
      }
    }, 400)
  }

  const loadWeather = async (name: string, lat: number, lon: number) => {
    setLoading(true)
    setFetchErr(null)
    setShowSugg(false)
    setQuery(name)
    try {
      const data = await fetchWeather(lat, lon, name)
      onWeatherChange(data)
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : '天気の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const today = weatherData?.days[0]

  return (
    <section className="border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-base">
            {today ? <WeatherIcon condition={today.condition} size={16} /> : '🌤'}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase">Weather Coord</span>
              {weatherData && useWeather && (
                <span className="text-[9px] font-bold text-blue-600 border border-blue-400 px-1.5 py-0.5 tracking-wider">
                  ON
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {weatherData
                ? `${weatherData.city} · ${today?.tempMin}°〜${today?.tempMax}° · ${today?.conditionJa}`
                : '都市を選択して天気連動コーデを有効に'}
            </div>
          </div>
          {weatherData && useWeather && (
            <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 font-bold">7日</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="p-5 space-y-4">

            {/* City search */}
            <div>
              <p className="section-label mb-2.5">都市を選択</p>
              {/* Preset chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => loadWeather(c.name, c.lat, c.lon)}
                    className={`text-[11px] font-medium px-2.5 py-1 border transition-all ${
                      weatherData?.city === c.name
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Free search */}
              <div className="relative" ref={suggRef}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="都市名で検索（例: 横浜）"
                    className="input-base flex-1 text-xs"
                  />
                  {loading && (
                    <div className="flex items-center px-3">
                      <div className="w-3 h-3 border border-gray-400 border-t-black rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {showSugg && suggestions.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 shadow-lg mt-0.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => loadWeather(s.name, s.lat, s.lon)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-gray-400">{s.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {fetchErr && <p className="text-[11px] text-red-500 mt-1">{fetchErr}</p>}
            </div>

            {/* Weather forecast strip */}
            {weatherData && (
              <>
                <div>
                  <p className="section-label mb-2.5">7日間予報</p>
                  <div className="grid grid-cols-7 gap-1">
                    {weatherData.days.map((d, i) => {
                      const dateObj = new Date(d.date)
                      const dayLabels = ['日', '月', '火', '水', '木', '金', '土']
                      const dayLabel = i === 0 ? '今日' : i === 1 ? '明日' : dayLabels[dateObj.getDay()]
                      const accentColor = CONDITION_COLORS[d.condition] ?? '#9CA3AF'
                      return (
                        <div key={d.date} className="flex flex-col items-center border border-gray-100 py-2 px-1">
                          <span className="text-[9px] font-bold text-gray-500 mb-1">{dayLabel}</span>
                          <span className="text-base leading-none mb-1">
                            <WeatherIcon condition={d.condition} size={18} />
                          </span>
                          <span className="text-[9px] font-black" style={{ color: accentColor === '#FCD34D' ? '#B45309' : accentColor }}>
                            {d.tempMax}°
                          </span>
                          <span className="text-[9px] text-gray-400">{d.tempMin}°</span>
                          {d.precipProb > 30 && (
                            <span className="text-[8px] text-blue-500 font-bold mt-0.5">{d.precipProb}%</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Toggle */}
                <div className="border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">天気連動コーデを有効にする</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        各日の天気・気温に合ったアイテムをAIが提案します
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleUse(!useWeather)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                        useWeather ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          useWeather ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Today's detail */}
                {today && useWeather && (
                  <div className="bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <WeatherIcon condition={today.condition} size={28} />
                      <div>
                        <p className="text-xs font-black">{today.conditionJa} · {today.tempMin}°〜{today.tempMax}°C</p>
                        <p className="text-[10px] text-gray-500">{weatherData.city} · 降水確率 {today.precipProb}%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-gray-600 bg-white border border-gray-100 p-2.5">
                      <span className="font-black text-[9px] text-gray-300 shrink-0 mt-0.5">TIP</span>
                      <span>{today.outfitAdvice}</span>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </section>
  )
}
