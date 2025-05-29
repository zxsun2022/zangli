'use client'

import React from 'react'

interface SelectedDateInfoProps {
  gregorianDate: Date
  tibetanDateInfo: {
    value: string
    month: number
    tMonth: string
    day: number
    dayLeap: boolean
    monthLeap: boolean
    dayMiss: boolean
    festivalInfo?: string
    error?: string
  } | null
  loading?: boolean
}

const SelectedDateInfo: React.FC<SelectedDateInfoProps> = ({
  gregorianDate,
  tibetanDateInfo,
  loading = false
}) => {
  const formatGregorianDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    return `${year}年${month}月${day}日 星期${weekday}`
  }

  const formatTibetanDate = (): string => {
    if (!tibetanDateInfo || tibetanDateInfo.error) {
      return '计算中...'
    }
    
    let result = tibetanDateInfo.value
    
    // 添加特殊标记说明
    if (tibetanDateInfo.dayLeap) {
      result += ' (此日为闰日)'
    }
    
    if (tibetanDateInfo.dayMiss) {
      result += ' (此日为缺日)'
    }
    
    if (tibetanDateInfo.monthLeap) {
      result += ' (此月为闰月)'
    }
    
    return result
  }

  if (loading) {
    return (
      <div className="selected-day" role="status" aria-live="polite">
        <div>计算藏历中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 顶部选中日期显示 */}
      <div className="selected-day" role="region" aria-label="选中的日期信息">
        <div className="text-lg font-semibold">
          {formatGregorianDate(gregorianDate)}
        </div>
        <div className="text-base mt-1">
          {formatTibetanDate()}
        </div>
        {tibetanDateInfo?.festivalInfo && (
          <div className="festival-info">
            🎊 {tibetanDateInfo.festivalInfo}
          </div>
        )}
      </div>

      {/* 底部详细信息显示 */}
      <div className="selected-day-bottom" role="complementary" aria-label="详细的藏历信息">
        {tibetanDateInfo?.error ? (
          <div className="text-red-600">
            {tibetanDateInfo.error}
          </div>
        ) : tibetanDateInfo ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span>
                <strong>藏历月:</strong> {tibetanDateInfo.tMonth}
              </span>
              <span>
                <strong>藏历日:</strong> {tibetanDateInfo.day}日
              </span>
            </div>
            
            {/* 特殊日期标记 */}
            {(tibetanDateInfo.dayLeap || tibetanDateInfo.dayMiss || tibetanDateInfo.monthLeap) && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                {tibetanDateInfo.dayLeap && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    闰日
                  </span>
                )}
                {tibetanDateInfo.dayMiss && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    缺日
                  </span>
                )}
                {tibetanDateInfo.monthLeap && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    闰月
                  </span>
                )}
              </div>
            )}
            
            {tibetanDateInfo.festivalInfo && (
              <div className="festival-info text-center">
                {tibetanDateInfo.festivalInfo}
              </div>
            )}
          </div>
        ) : (
          <div>请选择一个日期查看藏历信息</div>
        )}
      </div>

      {/* 藏历说明 */}
      <div className="text-xs text-secondary bg-card-bg p-3 rounded-lg border border-border">
        <h3 className="font-semibold mb-2">藏历说明：</h3>
        <ul className="space-y-1 text-left">
          <li><strong>闰日：</strong>藏历中重复的日期，当天会过两次</li>
          <li><strong>缺日：</strong>藏历中跳过的日期，当天不存在</li>
          <li><strong>闰月：</strong>藏历中重复的月份，该月会有两个</li>
        </ul>
      </div>
    </div>
  )
}

export default SelectedDateInfo 