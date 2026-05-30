interface Props {
  category: string
  color: string
  size?: number
}

const svgPaths: Record<string, JSX.Element> = {
  トップス: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 12 C28 12 34 20 40 20 C46 20 52 12 52 12 L68 22 L60 34 L54 30 L54 68 L26 68 L26 30 L20 34 L12 22 Z"
        fill="currentColor" opacity="0.9" strokeLinejoin="round"/>
    </svg>
  ),
  ボトムス: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 16 L28 16 L40 48 L52 16 L64 16 L64 24 L54 24 L54 68 L44 68 L40 52 L36 68 L26 68 L26 24 L16 24 Z"
        fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  シューズ: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 52 C10 52 14 36 22 32 L32 28 L36 20 L46 22 L46 32 C52 32 62 36 68 48 L68 56 C68 58 66 60 64 60 L14 60 C12 60 10 58 10 56 Z"
        fill="currentColor" opacity="0.9"/>
      <path d="M36 20 L46 22 L46 32 L32 28 Z" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  アウター: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 10 L18 16 L10 28 L18 34 L22 28 L22 68 L58 68 L58 28 L62 34 L70 28 L62 16 L54 10 L48 18 C46 22 34 22 32 18 Z"
        fill="currentColor" opacity="0.9"/>
      <path d="M40 18 L40 68" stroke="white" strokeWidth="1.5" opacity="0.3"/>
    </svg>
  ),
  バッグ: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="30" width="52" height="38" rx="4" fill="currentColor" opacity="0.9"/>
      <path d="M28 30 C28 30 28 16 40 16 C52 16 52 30 52 30" stroke="currentColor" strokeWidth="3.5" fill="none" opacity="0.9"/>
      <rect x="34" y="44" width="12" height="8" rx="2" fill="white" opacity="0.4"/>
    </svg>
  ),
  アクセサリー: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="6" fill="none" opacity="0.9"/>
      <circle cx="40" cy="40" r="10" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
}

export default function ClothingIcon({ category, color, size = 64 }: Props) {
  const icon = svgPaths[category] ?? svgPaths['アクセサリー']

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size, color }}
    >
      {icon}
    </div>
  )
}
