import LRUCache from "@/utils/lru";
import { AxiosRequestConfig, AxiosResponse, BusinessError, ErrorCode, RequestModule } from "../type";
// 缓存模块
export class CacheManager implements RequestModule {
  constructor(private cache: LRUCache) {}

  async onRequest(config: AxiosRequestConfig) {
    if (!config.cache) return config;
    const key = this.generateKey(config);
    const data = this.cache.get(key);
    config.metaData ={
      ...config.metaData,
      originalData: config.data // 存储未加密的原始数据
    };
    if (data) {
      // 利用抛出错误的方式，终止请求链。
      return Promise.reject(new BusinessError(ErrorCode.CACHED, '缓存命中', data));
    }
    return config;
  }

  onResponse(response: AxiosResponse) {
    const isCache = response.config.cache;
    if (isCache) {   
      // 使用原始数据生成缓存键
      const key = this.generateKey({
        ...response.config,
        data: response.config.metaData?.originalData // 使用存储的原始数据
      });
      this.cache.set(key, response.data);
    }
    return response;
  }

  // 生成稳定的请求key
  private generateKey(config: AxiosRequestConfig): string { // 暂时只处理url和data 
    return `${config.url}-${typeof config.data ==='string'?config.data:JSON.stringify(config.data)}`;
  }
}
