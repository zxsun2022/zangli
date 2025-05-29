'use client'

import React, { useState, useEffect } from 'react'
import zangliCore from '@/lib/zangli-core'

interface CalendarDay {
  gregorianDate: number
  tibetanDate: string
  isToday: boolean
  isSelected: boolean
  hasFestival: boolean
  festivalName?: string
  isLeapDay?: boolean
  isMissingDay?: boolean
  isLeapMonth?: boolean
}

interface CalendarTableProps {
  year: number
  month: number
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

const CalendarTable: React.FC<CalendarTableProps> = ({
  year,
  month,
  onDateSelect,
  selectedDate
}) => {
  const [calendarData, setCalendarData] = useState<CalendarDay[][]>([])
  const [loading, setLoading] = useState(true)

  // 生成日历数据
  useEffect(() => {
    generateCalendarData()
  }, [year, month, selectedDate])

  const generateCalendarData = async () => {
    setLoading(true)
    try {
      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      const firstDayWeek = firstDay.getDay()
      const daysInMonth = lastDay.getDate()
      
      // 计算需要显示的周数
      const totalCells = Math.ceil((daysInMonth + firstDayWeek) / 7) * 7
      const weeks: CalendarDay[][] = []
      
      let currentWeek: CalendarDay[] = []
      let dayCount = 1
      
      for (let i = 0; i < totalCells; i++) {
        if (i < firstDayWeek || dayCount > daysInMonth) {
          // 空白单元格或下个月的日期
          currentWeek.push({
            gregorianDate: 0,
            tibetanDate: '',
            isToday: false,
            isSelected: false,
            hasFestival: false
          })
        } else {
          // 当前月的日期
          const currentDate = new Date(year, month - 1, dayCount)
          const isToday = isDateToday(currentDate)
          const isSelected = selectedDate ? isSameDate(currentDate, selectedDate) : false
          
          // 计算藏历信息
          let tibetanDate = '计算中...'
          let hasFestival = false
          let festivalName = ''
          let isLeapDay = false
          let isMissingDay = false
          let isLeapMonth = false
          
          try {
            // 检查日期是否在支持范围内
            if (zangliCore.isDateSupported(currentDate)) {
              const tibetanInfo = await zangliCore.getZangli(currentDate)
              if (!tibetanInfo.error) {
                tibetanDate = `${tibetanInfo.day}日`
                if (tibetanInfo.monthLeap) {
                  tibetanDate = `闰${tibetanDate}`
                }
                hasFestival = !!tibetanInfo.festivalInfo
                festivalName = tibetanInfo.festivalInfo || ''
                isLeapDay = tibetanInfo.dayLeap
                isMissingDay = tibetanInfo.dayMiss
                isLeapMonth = tibetanInfo.monthLeap
              } else {
                tibetanDate = '超出范围'
              }
            } else {
              tibetanDate = '超出范围'
            }
          } catch (error) {
            console.error('计算藏历失败:', error)
            tibetanDate = '计算失败'
          }
          
          currentWeek.push({
            gregorianDate: dayCount,
            tibetanDate,
            isToday,
            isSelected,
            hasFestival,
            festivalName,
            isLeapDay,
            isMissingDay,
            isLeapMonth
          })
          
          dayCount++
        }
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      }
      
      setCalendarData(weeks)
    } catch (error) {
      console.error('生成日历数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDateToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.gregorianDate > 0) {
      const selectedDate = new Date(year, month - 1, day.gregorianDate)
      onDateSelect(selectedDate)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, day: CalendarDay) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDateClick(day)
    }
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="text-lg">正在加载藏历数据...</div>
      </div>
    )
  }

  return (
    <div className="w-full" role="region" aria-labelledby="calendar-title">
      <h2 
        id="calendar-title" 
        className="text-2xl font-bold text-center mb-6 text-primary"
        aria-live="polite"
      >
        {year}年{monthNames[month - 1]}
      </h2>
      
      <table 
        className="calendar-table" 
        role="grid" 
        aria-label={`${year}年${monthNames[month - 1]}日历`}
      >
        <caption className="sr-only">
          公历藏历对照日历，使用方向键导航，空格键或回车键选择日期
        </caption>
        
        <thead>
          <tr role="row">
            {weekdays.map((day, index) => (
              <th
                key={day}
                scope="col"
                role="columnheader"
                aria-label={`星期${day}`}
                className={index === 0 || index === 6 ? 'text-red-200' : ''}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {calendarData.map((week, weekIndex) => (
            <tr key={weekIndex} role="row">
              {week.map((day, dayIndex) => (
                <td
                  key={`${weekIndex}-${dayIndex}`}
                  role="gridcell"
                  tabIndex={day.gregorianDate > 0 ? 0 : -1}
                  aria-selected={day.isSelected}
                  aria-label={
                    day.gregorianDate > 0 
                      ? `${year}年${month}月${day.gregorianDate}日，藏历${day.tibetanDate}${day.hasFestival ? `，${day.festivalName}` : ''}${day.isToday ? '，今天' : ''}`
                      : '空白日期'
                  }
                  className={`
                    ${day.gregorianDate === 0 ? 'opacity-30 cursor-default' : 'cursor-pointer hover:bg-gray-100'}
                    ${day.isToday ? 'today' : ''}
                    ${day.isSelected ? 'selected' : ''}
                    ${day.hasFestival ? 'has-festival border-accent' : ''}
                    ${day.isLeapMonth ? 'bg-blue-50' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                  onKeyDown={(e) => handleKeyDown(e, day)}
                >
                  {day.gregorianDate > 0 && (
                    <div className="date-cell">
                      <div className="gregorian-date">
                        {day.gregorianDate}
                      </div>
                      <div className="tibetan-date">
                        {day.tibetanDate}
                      </div>
                      {day.hasFestival && (
                        <div 
                          className="festival-indicator" 
                          aria-label="有节日"
                          title={day.festivalName}
                        />
                      )}
                      {day.isLeapDay && (
                        <div className="text-xs text-blue-600 font-semibold" aria-label="闰日">
                          闰
                        </div>
                      )}
                      {day.isMissingDay && (
                        <div className="text-xs text-gray-500" aria-label="缺日">
                          缺
                        </div>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CalendarTable 