import { AxiosRequestConfig, RequestModule, URLMap } from "../type";
export class TransformURLManager implements RequestModule {
    constructor(private urlMap: URLMap) {}
  
    async onRequest(config: AxiosRequestConfig) {
			if (config.closeUrlTransform) return config;
      const originalUrl = config.url;
      if (!originalUrl || !this.urlMap[originalUrl]) return config;
  
      const mappedUrl = this.urlMap[originalUrl];
      
      if (typeof mappedUrl === "function") {
        // 合并 params 和 data 作为参数（根据请求方法自动适配）
        const dynamicParams = {
          ...(config.method?.toLowerCase() === 'get' ? config.params : config.data),
          ...config.params // 保留显式传入的查询参数
        };
        config.url = mappedUrl(dynamicParams);
      } else {
        config.url = mappedUrl;
      }
  
      return config;
    }
  }

// 后续可以做的一些考虑
// 1. 设置命名空间，来对接口映射做出处理（防止所有映射都在一个文件里）
// 2. 考虑动态映射