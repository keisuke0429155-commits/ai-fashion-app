export default function MockBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <p className="text-xs text-amber-700 font-medium">
        デモモード — ダミーデータで動作中。
        <span className="text-amber-500 font-normal ml-1">
          本番利用は <code className="bg-amber-100 px-1 rounded">.env.local</code> に
          <code className="bg-amber-100 px-1 rounded ml-1">ANTHROPIC_API_KEY</code> を設定してください。
        </span>
      </p>
    </div>
  )
}
