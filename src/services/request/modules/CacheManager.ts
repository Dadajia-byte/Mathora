import LRUCache from "@/utils/lru";
import { AxiosRequestConfig, AxiosResponse, RequestModule } from "../type";
// 缓存模块
export class CacheManager implements RequestModule {
  constructor(private cache: LRUCache) {}

  async onRequest(config: AxiosRequestConfig) {
    if (!config.cache) return config;
    
    const key = this.generateKey(config);
    const cached = this.cache.get(key);
    if (cached) {
      return { ...config, data: cached, __fromCache: true };
    }
    return config;
  }

  onResponse(response: AxiosResponse) {
    if (response.config.cache && !response.config.__fromCache) {
      const key = this.generateKey(response.config);
      this.cache.set(key, response.data);
    }
    return response;
  }

  // 生成稳定的请求key
  private generateKey(config: AxiosRequestConfig): string {
    const stableStringify = (obj: any): string => {
      if (obj === null || obj === undefined) return 'null';
      if (typeof obj !== 'object') return JSON.stringify(obj);
      if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
      const keys = Object.keys(obj).sort();
      return `{${keys.map(k => `"${k}":${stableStringify(obj[k])}`).join(',')}}`;
    };
    return `${config.url}-${stableStringify(config.params)}-${stableStringify(config.data)}`;
  }
}

export default CacheManager;