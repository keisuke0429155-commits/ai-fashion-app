'use client'

import { useState } from 'react'
import { WeeklyOutfitPlan } from '@/types'
import { WeatherData } from '@/lib/weather'
import DayOutfitSection from './DayOutfitSection'

interface Props {
  plan: WeeklyOutfitPlan
  weatherData: WeatherData | null
  onReset: () => void
}

export default function WeeklyOutfitResult({ plan, weatherData, onReset }: Props) {
  const [activeDay, setActiveDay] = useState<number>(0)

  const totalItems   = plan.outfits.reduce((s, d) => s + d.items.length, 0)
  const totalPrice   = plan.outfits.reduce((s, d) => s + d.items.reduce((ss, i) => ss + i.price, 0), 0)
  const avgDaily     = Math.round(totalPrice / plan.outfits.length)

  return (
    <div className="anim-scale-in">

      {/* ── Hero banner ── */}
      <div className="bg-black text-white px-5 md:px-8 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <p className="section-label text-gray-500 mb-3">Your Weekly Style Plan</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black leading-none tracking-tight">
                7 DAYS<br />
                <span className="text-gray-600">COORDINATE</span>
              </h2>
              <p className="mt-4 text-sm text-gray-400 max-w-lg leading-relaxed">
                {plan.overallConcept}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 md:flex md:gap-10 shrink-0">
              {[
                { label: 'Days', value: '7' },
                { label: 'Items', value: String(totalItems) },
                { label: 'Total', value: `¥${Math.round(totalPrice / 1000)}K` },
                { label: 'Daily', value: `¥${Math.round(avgDaily / 1000)}K` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-xl md:text-3xl font-black">{value}</div>
                  <div className="text-[9px] tracking-[0.2em] uppercase text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Day quick-jump tabs ── */}
      <div className="border-b border-gray-200 bg-white sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex overflow-x-auto gap-0 scrollbar-none">
            {plan.outfits.map((outfit, i) => {
              const wd = weatherData?.days[i]
              return (
                <button
                  key={i}
                  onClick={() => setActiveDay(activeDay === i ? -1 : i)}
                  className={`shrink-0 flex flex-col items-center justify-center px-5 py-3 border-b-2 transition-all duration-150 gap-0.5
                    ${activeDay === i
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {wd && <span className="text-sm leading-none mb-0.5">{wd.icon}</span>}
                  <span className="text-[9px] tracking-widest uppercase font-bold">{outfit.dayEn}</span>
                  <span className="text-[11px] font-medium">{outfit.day.replace('曜日', '')}</span>
                  {wd && <span className="text-[8px] text-gray-400">{wd.tempMax}°/{wd.tempMin}°</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Day sections ── */}
      <div className="max-w-7xl mx-auto px-0 md:px-0 divide-y divide-gray-100">
        {plan.outfits.map((outfit, i) => (
          <DayOutfitSection
            key={i}
            outfit={outfit}
            index={i}
            isActive={activeDay === i}
            onToggle={() => setActiveDay(activeDay === i ? -1 : i)}
            weatherDay={weatherData?.days[i]}
          />
        ))}
      </div>

      {/* ── Footer actions ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 mt-12 pt-8 pb-8 border-t border-gray-200">
        <p className="text-xs text-gray-400 mb-4 text-center sm:text-left">
          気に入らない場合は再生成できます。プロフィールを変えて試してみてください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onReset} className="flex-1 sm:flex-none sm:px-7 py-3.5 btn-outline">
            Profile を変更
          </button>
          <button onClick={onReset} className="flex-1 sm:flex-none sm:px-7 py-3.5 btn-primary">
            再生成
          </button>
        </div>
      </div>

    </div>
  )
}
