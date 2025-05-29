// 数据加载器 - 实现按需加载和缓存
interface YearData {
  year: number;
  data: number[][];
  metadata: {
    months: number;
    startDate: string;
    endDate: string;
  };
}

interface DecadeData {
  decade: number;
  years: {
    year: number;
    data: number[][];
  }[];
  metadata: {
    startYear: number;
    endYear: number;
    totalYears: number;
  };
}

class DataLoader {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  // 获取年度数据
  async loadYearData(year: number): Promise<YearData | null> {
    const cacheKey = `year-${year}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // 开始加载
    const loadPromise = this.fetchYearData(year);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      this.loadingPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  // 获取十年数据
  async loadDecadeData(decade: number): Promise<DecadeData | null> {
    const cacheKey = `decade-${decade}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadPromise = this.fetchDecadeData(decade);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      this.loadingPromises.delete(cacheKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  // 预加载相邻年份的数据
  async preloadAdjacentYears(currentYear: number) {
    const promises = [];
    
    // 预加载前一年和后一年
    if (currentYear > 1951) {
      promises.push(this.loadYearData(currentYear - 1));
    }
    if (currentYear < 2050) {
      promises.push(this.loadYearData(currentYear + 1));
    }

    // 静默预加载，不等待结果
    if (promises.length > 0) {
      Promise.allSettled(promises).catch(() => {
        // 预加载失败不影响主功能
      });
    }
  }

  // 实际的数据获取方法
  private async fetchYearData(year: number): Promise<YearData | null> {
    try {
      // 使用动态导入
      const module = await import(`../data/${year}.json`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load year data for ${year}:`, error);
      return null;
    }
  }

  private async fetchDecadeData(decade: number): Promise<DecadeData | null> {
    try {
      const module = await import(`../data/${decade}s.json`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load decade data for ${decade}s:`, error);
      return null;
    }
  }

  // 清理缓存
  clearCache() {
    this.cache.clear();
  }

  // 获取缓存状态
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): string {
    let totalSize = 0;
    this.cache.forEach(value => {
      totalSize += JSON.stringify(value).length * 2; // 粗略估计字符的字节数
    });
    
    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  }
}

// 单例模式
const dataLoader = new DataLoader();

export default dataLoader;
export type { YearData, DecadeData }; 