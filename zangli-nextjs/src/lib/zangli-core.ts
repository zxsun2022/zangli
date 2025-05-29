// 藏历核心计算库
import dataLoader, { YearData } from './data-loader';

interface ZangliResult {
  value: string;
  extraInfo?: string;
  month: number;
  tMonth: string;
  day: number;
  dayLeap: boolean;
  monthLeap: boolean;
  dayMiss: boolean;
  error?: string;
  festivalInfo?: string;
}

// 藏历月份名称
const tibetanMonths = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

// 完整的藏历节日信息
const festivals: { [key: string]: string } = {
  // 一月节日
  "1-1": "藏历新年（洛萨）",
  "1-3": "胜利节",
  "1-8": "弥勒佛节",
  "1-15": "神变节（酥油花灯节）",
  "1-25": "宗喀巴圆寂日",
  "1-29": "驱鬼节",
  
  // 二月节日  
  "2-15": "涅槃节",
  "2-29": "闰土节",
  
  // 三月节日
  "3-8": "妇女节",
  "3-15": "佛陀入胎节",
  
  // 四月节日
  "4-7": "诞生节",
  "4-15": "萨噶达瓦节（佛诞节、成道节、涅槃节）",
  "4-22": "拜师节",
  
  // 五月节日
  "5-10": "莲师诞生节",
  "5-15": "佛陀初转法轮节",
  "5-25": "米拉日巴圆寂节",
  
  // 六月节日
  "6-4": "转法轮节（初转法轮日）",
  "6-10": "莲师纪念日",
  "6-15": "佛陀入胎节",
  "6-25": "观音节",
  
  // 七月节日
  "7-6": "佛陀初转法轮节",
  "7-10": "莲师圣诞",
  "7-15": "雪顿节",
  "7-30": "沐浴节",
  
  // 八月节日
  "8-10": "莲师节",
  "8-22": "燃灯节前夜",
  
  // 九月节日
  "9-9": "重阳节",
  "9-22": "降神节（佛陀从天界返回）",
  "9-29": "药师佛节",
  
  // 十月节日
  "10-10": "莲师节",
  "10-15": "倍加节",
  "10-25": "燃灯节（宗喀巴诞辰）",
  
  // 十一月节日
  "11-10": "莲师节",
  "11-29": "供护法节",
  
  // 十二月节日
  "12-8": "释迦牟尼成道节",
  "12-10": "莲师节",
  "12-29": "驱鬼节（年终）"
};

// 每月初十的莲师节
function isGuruRinpocheDay(month: number, day: number): string | null {
  if (day === 10) {
    return `莲师节（莲花生大师纪念日）`;
  }
  return null;
}

// 特殊计算的节日（如满月日等）
function getSpecialFestivals(month: number, day: number): string | null {
  // 每月十五（满月日）的特殊意义
  if (day === 15) {
    const moonFestivals = [
      "神变节（酥油花灯节）",  // 1月15
      "涅槃节",               // 2月15
      "佛陀入胎节",           // 3月15
      "萨噶达瓦节",           // 4月15
      "佛陀初转法轮节",       // 5月15
      "佛陀入胎节",           // 6月15
      "雪顿节",               // 7月15
      "满月节",               // 8月15
      "满月节",               // 9月15
      "倍加节",               // 10月15
      "满月节",               // 11月15
      "满月节"                // 12月15
    ];
    
    if (month >= 1 && month <= 12) {
      return moonFestivals[month - 1];
    }
  }
  
  // 莲师日
  const guruDay = isGuruRinpocheDay(month, day);
  if (guruDay) return guruDay;
  
  return null;
}

class ZangliCore {
  private startDate = new Date("1951/1/8");
  private endDate = new Date("2051/2/11");

  async getZangli(date?: string | Date | number): Promise<ZangliResult> {
    let d: Date;
    
    if (typeof date === "undefined" || date === "") {
      d = new Date();
    } else if (typeof date === "string") {
      d = new Date(date);
      if (d.toString() === "Invalid Date") {
        return { 
          value: "error", 
          error: `错误："${date}" 字符串的日期格式不对`,
          month: 0, tMonth: "", day: 0, dayLeap: false, monthLeap: false, dayMiss: false
        };
      }
    } else if (typeof date === "number") {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return {
        value: "error",
        error: "只能接受日期类型、数字类型或者标准格式的字符串类型输入",
        month: 0, tMonth: "", day: 0, dayLeap: false, monthLeap: false, dayMiss: false
      };
    }

    // 检查日期范围
    if (d.getTime() < this.startDate.getTime()) {
      return {
        value: "error",
        error: `错误:不能转换早于${this.startDate.getFullYear()}年${this.startDate.getMonth() + 1}月${this.startDate.getDate()}日的日期`,
        month: 0, tMonth: "", day: 0, dayLeap: false, monthLeap: false, dayMiss: false
      };
    }

    if (d.getTime() >= (this.endDate.getTime() + 86400000)) {
      return {
        value: "error",
        error: `错误:不能转换晚于${this.endDate.getFullYear()}年${this.endDate.getMonth() + 1}月${this.endDate.getDate()}日的日期`,
        month: 0, tMonth: "", day: 0, dayLeap: false, monthLeap: false, dayMiss: false
      };
    }

    const days = Math.round((d.getTime() - this.startDate.getTime()) / 86400 / 1000);
    
    try {
      const result = await this.calculateZangli(days);
      
      // 添加节日信息
      const festivalKey = `${result.month}-${result.day}`;
      let festivalInfo = festivals[festivalKey];
      
      // 如果没有找到固定节日，检查特殊节日
      if (!festivalInfo) {
        const specialFestival = getSpecialFestivals(result.month, result.day);
        if (specialFestival) {
          festivalInfo = specialFestival;
        }
      }
      
      if (festivalInfo) {
        result.festivalInfo = festivalInfo;
      }
      
      return result;
    } catch (error) {
      return {
        value: "error",
        error: `计算藏历时出错: ${error}`,
        month: 0, tMonth: "", day: 0, dayLeap: false, monthLeap: false, dayMiss: false
      };
    }
  }

  private async calculateZangli(days: number): Promise<ZangliResult> {
    let countingDays = 0;
    const startYear = 1951;
    
    for (let yearIndex = 0; yearIndex < 100; yearIndex++) { // 假设最多100年
      const currentYear = startYear + yearIndex;
      
      // 加载当年数据
      const yearData = await dataLoader.loadYearData(currentYear);
      if (!yearData) {
        throw new Error(`无法加载 ${currentYear} 年的数据`);
      }

      const specialDays = yearData.data;
      let leapMonths = 0;
      
      for (let months = 0; months < specialDays.length; months++) {
        let tDays = 30; // 标准月份天数
        
        // 计算实际天数
        for (let i = 0; i < specialDays[months].length; i++) {
          const specialDay = specialDays[months][i];
          if (specialDay < 0) tDays--; // 缺日
          else if (specialDay > 0) tDays++; // 闰日
          else if (specialDay === 0) leapMonths++; // 闰月
        }
        
        if (countingDays + tDays <= days) {
          countingDays += tDays;
        } else {
          // 找到了目标月份
          let dayLeap = false;
          let dayMiss = false;
          let monthLeap = false;
          let tDays2 = days - countingDays;
          
          for (let i = 0; i < specialDays[months].length; i++) {
            const specialDay = specialDays[months][i];
            if (specialDay === 0) {
              monthLeap = true;
            } else {
              if (specialDay + 1 === -tDays2) {
                dayMiss = true;
                tDays2++;
              } else if (specialDay === tDays2) {
                dayLeap = true;
                tDays2--;
              } else if (specialDay > 0 && specialDay < tDays2) {
                tDays2--;
              } else if (specialDay < 0 && -specialDay - 1 < tDays2) {
                tDays2++;
              }
            }
          }
          
          // 计算最终的月份和日期
          let finalMonth: number;
          if (yearIndex === 0) {
            // 1951年特殊处理
            finalMonth = 12 - specialDays.length + months + 1;
          } else {
            finalMonth = months + 1;
          }
          
          // 处理闰月
          if (monthLeap) {
            leapMonths++;
          }
          
          const tMonth = monthLeap ? 
            `闰${tibetanMonths[finalMonth - 1]}` : 
            tibetanMonths[finalMonth - 1];
          
          const value = `${currentYear}年${tMonth}${tDays2}日${dayLeap ? "（闰日）" : ""}${dayMiss ? "（缺日）" : ""}`;
          
          return {
            value,
            month: finalMonth,
            tMonth,
            day: tDays2,
            dayLeap,
            monthLeap,
            dayMiss
          };
        }
      }
    }
    
    throw new Error("计算藏历失败：超出数据范围");
  }

  // 获取当前藏历日期
  async getCurrentZangli(): Promise<ZangliResult> {
    return this.getZangli(new Date());
  }

  // 检查日期是否在支持范围内
  isDateSupported(date: Date): boolean {
    return date.getTime() >= this.startDate.getTime() && 
           date.getTime() < (this.endDate.getTime() + 86400000);
  }

  // 获取支持的日期范围
  getSupportedDateRange() {
    return {
      start: this.startDate,
      end: this.endDate
    };
  }
}

// 单例模式
const zangliCore = new ZangliCore();

export default zangliCore;
export type { ZangliResult }; 