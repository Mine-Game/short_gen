interface ProgressBarProps {
  value: number
  max: number
  label: string
  percentage?: boolean
}

export default function ProgressBar({ value, max, label, percentage = false }: ProgressBarProps) {
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">
          {percentage ? `${percent.toFixed(1)}%` : value.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}
