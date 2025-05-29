'use client'

import React from 'react'

interface NavigationControlsProps {
  year: number
  month: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onTodayClick: () => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onPrevYear: () => void
  onNextYear: () => void
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  onTodayClick,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear
}) => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // 生成年份选项 (1951-2050)
  const yearOptions = []
  for (let y = 1951; y <= 2050; y++) {
    yearOptions.push(y)
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const isToday = year === currentYear && month === currentMonth

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onYearChange(parseInt(e.target.value))
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(parseInt(e.target.value))
  }

  const handlePrevYear = () => {
    if (year > 1951) {
      onPrevYear()
    }
  }

  const handleNextYear = () => {
    if (year < 2050) {
      onNextYear()
    }
  }

  const handlePrevMonth = () => {
    onPrevMonth()
  }

  const handleNextMonth = () => {
    onNextMonth()
  }

  const handleTodayClick = () => {
    onTodayClick()
  }

  return (
    <div className="controls" role="navigation" aria-label="日历导航控制">
      {/* 年月选择器 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="font-semibold text-primary">
            年份:
          </label>
          <select
            id="year-select"
            value={year}
            onChange={handleYearChange}
            className="px-3 py-2 border-2 border-border rounded-lg bg-card-bg text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="选择年份"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="font-semibold text-primary">
            月份:
          </label>
          <select
            id="month-select"
            value={month}
            onChange={handleMonthChange}
            className="px-3 py-2 border-2 border-border rounded-lg bg-card-bg text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="选择月份"
          >
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 导航按钮 - 使用CSS Grid确保横排 */}
      <div className="nav-grid">
        <button
          onClick={handlePrevYear}
          className="nav-btn"
          aria-label="上一年"
          title="上一年"
          disabled={year <= 1951}
        >
          ◄◄
        </button>
        
        <button
          onClick={handlePrevMonth}
          className="nav-btn"
          aria-label="上个月"
          title="上个月"
        >
          ◄
        </button>
        
        <button
          onClick={handleTodayClick}
          className={`nav-btn ${isToday ? 'today-btn' : ''}`}
          aria-label="回到今天"
          title="回到今天"
        >
          今天
        </button>
        
        <button
          onClick={handleNextMonth}
          className="nav-btn"
          aria-label="下个月"
          title="下个月"
        >
          ►
        </button>
        
        <button
          onClick={handleNextYear}
          className="nav-btn"
          aria-label="下一年"
          title="下一年"
          disabled={year >= 2050}
        >
          ►►
        </button>
      </div>

      {/* 键盘快捷键提示 */}
      <div className="mt-4 text-sm text-secondary text-center">
        <div className="hidden md:block">
          快捷键：← 上月 | → 下月 | ↑ 上年 | ↓ 下年 | T 今天
        </div>
      </div>
    </div>
  )
}

export default NavigationControls 