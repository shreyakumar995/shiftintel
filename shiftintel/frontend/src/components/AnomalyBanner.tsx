type Props = {
  description: string
  zones: string[]
}

export default function AnomalyBanner({ description, zones }: Props) {
  return (
    <div className="anomaly-banner bg-red-900 border border-red-500 rounded-lg p-4 mb-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-300 font-semibold text-sm">⚠ Pattern Detected</span>
      </div>
      <p className="text-red-100 text-sm mb-2">{description}</p>
      <div className="flex gap-2 flex-wrap">
        {zones.map((zone) => (
          <span key={zone} className="bg-red-700 text-red-50 text-xs px-2 py-1 rounded-full">
            {zone}
          </span>
        ))}
      </div>
    </div>
  )
}
