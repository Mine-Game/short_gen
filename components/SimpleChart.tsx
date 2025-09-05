interface SimpleChartProps {
  data: Array<{ label: string; value: number }>
  title: string
  type?: 'bar' | 'pie'
}

export default function SimpleChart({ data, title, type = 'bar' }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0)
                
                return (
                  <circle
                    key={item.label}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={item.label} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-gray-900 font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
