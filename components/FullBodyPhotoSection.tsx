'use client'

import { useState, useRef } from 'react'

export type BodyPhoto = { data: string; mediaType: string }

interface Props {
  photo: BodyPhoto | null
  onPhotoChange: (photo: BodyPhoto | null) => void
}

async function compressBodyPhoto(file: File): Promise<BodyPhoto> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 900
      let { width, height } = img
      if (width > height) {
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
      } else {
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      const data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
      resolve({ data, mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function FullBodyPhotoSection({ photo, onPhotoChange }: Props) {
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setLoading(true)
    try {
      const compressed = await compressBodyPhoto(file)
      localStorage.setItem('ai_stylist_body_photo', JSON.stringify(compressed))
      onPhotoChange(compressed)
    } catch {
      alert('写真の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    localStorage.removeItem('ai_stylist_body_photo')
    onPhotoChange(null)
  }

  return (
    <section className="border border-gray-100 p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="section-label">Full Body Photo</p>
            {photo && (
              <span className="text-[9px] font-black tracking-widest bg-emerald-500 text-white px-2 py-0.5">
                AI 反映中
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            全身写真を登録すると Claude AI が体型・肌トーン・プロポーションを直接見て、<br className="hidden sm:block" />
            あなたに最も似合うコーデを提案します
          </p>
        </div>
      </div>

      {photo ? (
        <div className="flex items-start gap-5">
          {/* Preview */}
          <div className="relative shrink-0">
            <div className="w-24 h-36 border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={`data:${photo.mediaType};base64,${photo.data}`}
                alt="全身写真"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold">全身写真を登録済み</p>
            <div className="space-y-1">
              {[
                'あなたの体型・シルエットを分析',
                '肌トーンに合うカラーを優先提案',
                'プロポーションに合ったフィット感を選択',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="w-3.5 h-3.5 bg-black text-white text-[8px] flex items-center justify-center shrink-0 font-bold">✓</span>
                  {t}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-[10px] text-gray-400 hover:text-black underline transition-colors"
              >
                写真を変更
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={handleRemove}
                className="text-[10px] text-gray-400 hover:text-red-500 underline transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !loading && fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-black transition-colors duration-150 cursor-pointer p-8 flex flex-col items-center gap-3 text-center group"
        >
          {loading ? (
            <>
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">写真を処理中…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-gray-100 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5">全身写真をアップロード</p>
                <p className="text-[10px] text-gray-400">クリックまたはドラッグ＆ドロップ</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <span>JPG</span><span>·</span><span>PNG</span><span>·</span><span>HEIC</span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
    </section>
  )
}
