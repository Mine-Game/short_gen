import { useState } from 'react'

interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

interface UTMFieldsProps {
  values: UTMData
  onChange: (values: UTMData) => void
}

export default function UTMFields({ values, onChange }: UTMFieldsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateValue = (key: keyof UTMData, value: string) => {
    onChange({
      ...values,
      [key]: value || undefined
    })
  }

  const hasBasicValues = values.utm_source || values.utm_medium || values.utm_campaign
  const hasAdvancedValues = values.utm_term || values.utm_content

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">UTM метки (необязательно)</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showAdvanced ? 'Скрыть дополнительные' : 'Дополнительные параметры'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Основные UTM параметры */}
        <div>
          <label htmlFor="utm_source" className="block text-xs font-medium text-gray-600 mb-1">
            Источник (utm_source)
          </label>
          <input
            id="utm_source"
            type="text"
            placeholder="google, facebook, email"
            value={values.utm_source || ''}
            onChange={(e) => updateValue('utm_source', e.target.value)}
            className="w-full h-10 rounded-lg border px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Откуда пришел трафик</p>
        </div>

        <div>
          <label htmlFor="utm_medium" className="block text-xs font-medium text-gray-600 mb-1">
            Канал (utm_medium)
          </label>
          <input
            id="utm_medium"
            type="text"
            placeholder="cpc, email, social, organic"
            value={values.utm_medium || ''}
            onChange={(e) => updateValue('utm_medium', e.target.value)}
            className="w-full h-10 rounded-lg border px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Тип маркетингового канала</p>
        </div>

        <div>
          <label htmlFor="utm_campaign" className="block text-xs font-medium text-gray-600 mb-1">
            Кампания (utm_campaign)
          </label>
          <input
            id="utm_campaign"
            type="text"
            placeholder="spring_sale, black_friday"
            value={values.utm_campaign || ''}
            onChange={(e) => updateValue('utm_campaign', e.target.value)}
            className="w-full h-10 rounded-lg border px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Название кампании</p>
        </div>
      </div>

      {/* Дополнительные UTM параметры */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="utm_term" className="block text-xs font-medium text-gray-600 mb-1">
              Ключевые слова (utm_term)
            </label>
            <input
              id="utm_term"
              type="text"
              placeholder="running+shoes, best+deals"
              value={values.utm_term || ''}
              onChange={(e) => updateValue('utm_term', e.target.value)}
              className="w-full h-10 rounded-lg border px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Ключевые слова для платной рекламы</p>
          </div>

          <div>
            <label htmlFor="utm_content" className="block text-xs font-medium text-gray-600 mb-1">
              Содержание (utm_content)
            </label>
            <input
              id="utm_content"
              type="text"
              placeholder="textlink, banner, button"
              value={values.utm_content || ''}
              onChange={(e) => updateValue('utm_content', e.target.value)}
              className="w-full h-10 rounded-lg border px-3 text-sm shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Тип контента или A/B тест</p>
          </div>
        </div>
      )}

      {/* Предварительный просмотр URL */}
      {(hasBasicValues || hasAdvancedValues) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">Предварительный просмотр URL с UTM метками:</p>
          <div className="font-mono text-xs text-gray-700 break-all bg-white p-2 rounded border">
            {values.utm_source && `utm_source=${values.utm_source}`}
            {values.utm_medium && `${values.utm_source ? '&' : ''}utm_medium=${values.utm_medium}`}
            {values.utm_campaign && `${values.utm_source || values.utm_medium ? '&' : ''}utm_campaign=${values.utm_campaign}`}
            {values.utm_term && `${values.utm_source || values.utm_medium || values.utm_campaign ? '&' : ''}utm_term=${values.utm_term}`}
            {values.utm_content && `${values.utm_source || values.utm_medium || values.utm_campaign || values.utm_term ? '&' : ''}utm_content=${values.utm_content}`}
          </div>
        </div>
      )}

      {/* Подсказки */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Совет:</strong> UTM метки помогают отследить эффективность ваших маркетинговых кампаний</p>
        <p>📊 <strong>Примеры использования:</strong></p>
        <ul className="ml-4 space-y-1 list-disc">
          <li><strong>Email рассылка:</strong> source=newsletter, medium=email, campaign=weekly_digest</li>
          <li><strong>Соцсети:</strong> source=facebook, medium=social, campaign=product_launch</li>
          <li><strong>Реклама:</strong> source=google, medium=cpc, campaign=keywords_campaign</li>
        </ul>
      </div>
    </div>
  )
}
