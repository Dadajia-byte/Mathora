import LRUCache from "@/utils/lru";
import { AxiosRequestConfig, AxiosResponse, RequestModule } from "../type";
// 缓存模块
export class CacheManager implements RequestModule {
  constructor(private cache: LRUCache) {}

  async onRequest(config: AxiosRequestConfig) {
    if (!config.data.cache) return config;
    const key = this.generateKey(config);
    console.log(key,1);
    
    console.log(this.cache.has(key));
    
    const cached = this.cache.get(key);
    if (cached) {
      console.log('from cache');
      
      return { ...config, data: cached, };
    }
    return config;
  }

  onResponse(response: AxiosResponse) {
    const isCache = JSON.parse(response.config.data).cache;
    
    if (isCache) {   
      console.log(response.config.data);
      const key = this.generateKey(response.config);
      console.log(key,2);
      
      this.cache.set(key, response.data);
    }
    return response;
  }

  // 生成稳定的请求key
  private generateKey(config: AxiosRequestConfig): string { // 暂时只处理url和data
    return `${config.url}-${typeof config.data ==='string'?config.data:JSON.stringify(config.data)}`;
  }
}

export default CacheManager;