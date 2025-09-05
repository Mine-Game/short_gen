'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Select } from '../../../../components/ui/select'
import StatCard from '../../../../components/StatCard'
import SimpleChart from '../../../../components/SimpleChart'
import ProgressBar from '../../../../components/ProgressBar'

interface AnalyticsData {
  overview: {
    totalClicks: number
    uniqueClicks: number
    repeatClicks: number
    uniqueRate: number
  }
  geography: {
    countries: Array<{ country: string; clicks: number }>
  }
  trafficSources: {
    categories: Array<{ source: string; count: number }>
    referers: Array<{ domain: string; clicks: number }>
  }
  utm: {
    campaigns: Array<{ campaign: string; source: string; medium: string; clicks: number }>
  }
  technology: {
    browsers: Array<{ browser: string; clicks: number }>
    devices: Array<{ device: string; clicks: number }>
  }
  timeline: Array<{ date: string; clicks: number; uniqueClicks: number }>
  links: Array<{ id: string; shortId: string; originalUrl: string; clicks: number }>
}

export default function StatsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [selectedLink, setSelectedLink] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [period, selectedLink])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ period })
      if (selectedLink) params.set('linkId', selectedLink)
      
      const response = await fetch(`/api/dashboard/analytics?${params}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Статистика</h1>
          <p className="text-gray-600">Загрузка аналитических данных...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Статистика</h1>
          <p className="text-gray-600">Ошибка загрузки данных</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Статистика</h1>
        <p className="text-gray-600">Детальный анализ переходов по вашим ссылкам</p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Период</label>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1">Сегодня</option>
            <option value="7">7 дней</option>
            <option value="30">30 дней</option>
            <option value="90">90 дней</option>
          </Select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Ссылка</label>
          <Select value={selectedLink} onChange={(e) => setSelectedLink(e.target.value)}>
            <option value="">Все ссылки</option>
            {data.links.map((link) => (
              <option key={link.id} value={link.id}>
                {link.shortId} ({link.clicks} кликов)
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего кликов"
          value={data.overview.totalClicks.toLocaleString()}
          description="За выбранный период"
          icon={<span className="text-2xl">📊</span>}
        />
        <StatCard
          title="Уникальные клики"
          value={data.overview.uniqueClicks.toLocaleString()}
          description={`${data.overview.uniqueRate}% от общего числа`}
          icon={<span className="text-2xl">👥</span>}
        />
        <StatCard
          title="Повторные клики"
          value={data.overview.repeatClicks.toLocaleString()}
          description={`${100 - data.overview.uniqueRate}% от общего числа`}
          icon={<span className="text-2xl">🔄</span>}
        />
        <StatCard
          title="Коэффициент уникальности"
          value={`${data.overview.uniqueRate}%`}
          description="Доля новых пользователей"
          icon={<span className="text-2xl">✨</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* География */}
        <Card>
          <CardHeader>
            <CardTitle>География пользователей</CardTitle>
            <CardDescription>Топ стран по количеству переходов</CardDescription>
          </CardHeader>
          <CardContent>
            {data.geography.countries.length > 0 ? (
              <SimpleChart
                data={data.geography.countries.map(item => ({
                  label: item.country,
                  value: item.clicks
                }))}
                title=""
                type="bar"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных о географии</p>
            )}
          </CardContent>
        </Card>

        {/* Источники трафика */}
        <Card>
          <CardHeader>
            <CardTitle>Источники трафика</CardTitle>
            <CardDescription>Откуда приходят пользователи</CardDescription>
          </CardHeader>
          <CardContent>
            {data.trafficSources.categories.length > 0 ? (
              <SimpleChart
                data={data.trafficSources.categories.map(item => ({
                  label: item.source,
                  value: item.count
                }))}
                title=""
                type="pie"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных об источниках</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Технологии */}
        <Card>
          <CardHeader>
            <CardTitle>Браузеры и устройства</CardTitle>
            <CardDescription>Технические характеристики пользователей</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.technology.browsers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Браузеры</h4>
                <div className="space-y-2">
                  {data.technology.browsers.slice(0, 5).map((browser) => (
                    <ProgressBar
                      key={browser.browser}
                      label={browser.browser}
                      value={browser.clicks}
                      max={Math.max(...data.technology.browsers.map(b => b.clicks)) || 1}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {data.technology.devices.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Устройства</h4>
                <div className="space-y-2">
                  {data.technology.devices.map((device) => (
                    <ProgressBar
                      key={device.device}
                      label={device.device === 'mobile' ? 'Мобильные' : device.device === 'desktop' ? 'Компьютеры' : 'Планшеты'}
                      value={device.clicks}
                      max={Math.max(...data.technology.devices.map(d => d.clicks)) || 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UTM кампании */}
        <Card>
          <CardHeader>
            <CardTitle>UTM кампании</CardTitle>
            <CardDescription>Аналитика по маркетинговым кампаниям</CardDescription>
          </CardHeader>
          <CardContent>
            {data.utm.campaigns.length > 0 ? (
              <div className="space-y-3">
                {data.utm.campaigns.slice(0, 10).map((campaign, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {campaign.campaign !== 'N/A' ? campaign.campaign : 'Без кампании'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {campaign.source !== 'N/A' && `Источник: ${campaign.source}`}
                          {campaign.medium !== 'N/A' && ` • Канал: ${campaign.medium}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {campaign.clicks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет данных о UTM метках</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Топ рефереры */}
      {data.trafficSources.referers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Топ источники переходов</CardTitle>
            <CardDescription>Сайты, с которых приходят пользователи</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trafficSources.referers.slice(0, 10).map((referer, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-900">{referer.domain}</span>
                  <span className="text-sm font-medium text-gray-600">{referer.clicks} кликов</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
