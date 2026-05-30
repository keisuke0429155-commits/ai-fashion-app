'use client'

import { useEffect, useState } from 'react'

const steps = [
  { label: 'プロフィールを分析', sublabel: 'Analyzing your profile' },
  { label: 'スタイルを選定', sublabel: 'Selecting your style' },
  { label: 'アイテムを組み合わせ', sublabel: 'Combining items' },
  { label: 'コーデを最終調整', sublabel: 'Finalizing coordinates' },
  { label: 'もうすぐ完成', sublabel: 'Almost done' },
]

export default function LoadingScreen() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => setStep((p) => Math.min(p + 1, steps.length - 1)), 3500)
    const progInterval = setInterval(() => setProgress((p) => Math.min(p + 0.8, 92)), 80)
    return () => { clearInterval(stepInterval); clearInterval(progInterval) }
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-10">

        {/* Animated grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square"
              style={{
                backgroundColor: i % 3 === 0 ? '#000' : i % 3 === 1 ? '#f0f0f0' : '#e8e8e8',
                opacity: 0.3 + Math.sin((i + step * 5) * 0.7) * 0.25,
                transition: 'opacity 0.8s ease',
              }}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-black rounded-full"
                style={{
                  animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-base font-bold">{steps[step].label}</p>
          <p className="text-xs text-gray-400 tracking-widest">{steps[step].sublabel}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-0.5 bg-gray-100 w-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] tracking-widest uppercase text-gray-400">AI Generating</span>
            <span className="text-[10px] font-bold tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-black' : i === step ? 'bg-black scale-150' : 'bg-gray-200'
                }`}
              />
              <span className={`text-[8px] tracking-wider hidden sm:block ${i <= step ? 'text-black' : 'text-gray-300'}`}>
                0{i + 1}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
