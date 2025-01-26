import LRUCache from "@/utils/lru";
import { AxiosRequestConfig, AxiosResponse, RequestServiceError, ErrorCode, RequestModule } from "../type";
// 缓存模块
export class CacheManager implements RequestModule {
  constructor(private cache: LRUCache) {}

  async onRequest(config: AxiosRequestConfig) {
    if (!config.cache) return config;
    const key = this.generateKey(config);
    const data = this.cache.get(key);
    if (data) return Promise.reject(new RequestServiceError(ErrorCode.CACHED, '缓存命中', data, config));
    return config;
  }

  onResponse(response: AxiosResponse) {
    const isCache = response.config.cache;
    if (isCache) {   
      // 使用原始数据生成缓存键
      const key = this.generateKey(response.config);
      this.cache.set(key, response.data);
    }
    return response;
  }

  // 生成稳定的请求key
  private generateKey(config: AxiosRequestConfig): string { // 暂时只处理url和data 
    return `${config.url}-${typeof config.metaData ==='string'?config.metaData:JSON.stringify(config.metaData)}`;
  }
}
