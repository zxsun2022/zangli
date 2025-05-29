'use client'

import React, { useState, useEffect } from 'react'
import CalendarTable from '@/components/CalendarTable'
import NavigationControls from '@/components/NavigationControls'
import SelectedDateInfo from '@/components/SelectedDateInfo'
import zangliCore from '@/lib/zangli-core'

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tibetanDateInfo, setTibetanDateInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // 初始化选中今天
  useEffect(() => {
    const today = new Date()
    setSelectedDate(today)
  }, [])

  // 当选中日期变化时，计算藏历
  useEffect(() => {
    if (selectedDate) {
      calculateTibetanDate(selectedDate)
    }
  }, [selectedDate])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入框中，不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          e.preventDefault()
          handlePrevMonth()
          break
        case 'arrowright':
          e.preventDefault()
          handleNextMonth()
          break
        case 'arrowup':
          e.preventDefault()
          handlePrevYear()
          break
        case 'arrowdown':
          e.preventDefault()
          handleNextYear()
          break
        case 't':
          e.preventDefault()
          handleTodayClick()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentDate])

  const calculateTibetanDate = async (date: Date) => {
    setLoading(true)
    try {
      // 使用真正的藏历计算逻辑
      const result = await zangliCore.getZangli(date)
      
      if (result.error) {
        setTibetanDateInfo({
          value: '',
          month: 0,
          tMonth: '',
          day: 0,
          dayLeap: false,
          monthLeap: false,
          dayMiss: false,
          error: result.error
        })
      } else {
        setTibetanDateInfo(result)
      }
    } catch (error) {
      console.error('计算藏历失败:', error)
      setTibetanDateInfo({
        value: '',
        month: 0,
        tMonth: '',
        day: 0,
        dayLeap: false,
        monthLeap: false,
        dayMiss: false,
        error: '计算藏历失败'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1))
  }

  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month - 1, 1))
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const handlePrevYear = () => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(newDate.getFullYear() - 1)
    setCurrentDate(newDate)
  }

  const handleNextYear = () => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(newDate.getFullYear() + 1)
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-amber-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 标题 */}
        <header className="text-center mb-8">
          <div className="bg-card-bg rounded-2xl shadow-custom p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              百年藏历
            </h1>
            <p className="text-lg text-secondary">
              藏历在线查询 (1951-2050)
            </p>
          </div>
        </header>

        {/* 选中日期信息 */}
        {selectedDate && (
          <SelectedDateInfo
            gregorianDate={selectedDate}
            tibetanDateInfo={tibetanDateInfo}
            loading={loading}
          />
        )}

        {/* 导航控制 */}
        <NavigationControls
          year={currentYear}
          month={currentMonth}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onTodayClick={handleTodayClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onPrevYear={handlePrevYear}
          onNextYear={handleNextYear}
        />

        {/* 日历表格 */}
        <div className="bg-card-bg rounded-2xl shadow-custom p-6">
          <CalendarTable
            year={currentYear}
            month={currentMonth}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate || undefined}
          />
        </div>

        {/* 页脚信息 */}
        <footer className="mt-8 text-center text-sm text-secondary">
          <div className="bg-card-bg rounded-xl p-4 shadow-custom">
            <p className="mb-2">
              数据来源：《藏历、公历、农历对照百年历书（1951-2050）》
            </p>
            <p className="text-xs opacity-75">
              支持离线使用 | PWA应用 | 无障碍访问
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
} 