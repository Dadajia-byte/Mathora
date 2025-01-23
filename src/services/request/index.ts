import axios, { AxiosInstance } from 'axios';
import { AxiosServiceOptions, RequestModule, AxiosRequestConfig, AxiosResponse, ErrorCode,BusinessError, Error } from './type';
import {
  AuthManager,
  ConcurrencyManager,
  CacheManager,
  EncryptionHandler,
  RequestDeduplicator,
  ErrorHandler
} from './modules/index';
import LRUCache from '@/utils/lru';

class AxiosService {
  private instance: AxiosInstance;
  private modules: RequestModule[] = [];
  constructor(option:AxiosServiceOptions) {
    this.instance = axios.create({
      baseURL: option.baseURL,
      timeout: option.timeout
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截链
    this.instance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
        for (const module of this.modules) {
          config = await module.onRequest?.(config) || config;
        }
        return config;
      }
    );
    // 响应拦截链
    this.instance.interceptors.response.use(
    (response: AxiosResponse) => {
      this.modules.forEach(module => module.onResponse?.(response));
      const { code, message, data } = response.data;
      if (code !== 10000) {
        const error = new BusinessError(code, message, data);
        throw error;
      }
      return response.data;
    },
    this.errorHandler.bind(this)
  );
  }
  get request() {
    return this.instance;
  }
  errorHandler (error:Error) {
    let businessError;
    if (error?.code) {
      switch (error.code) {
        case ErrorCode.CACHED:
          return Promise.resolve((error as BusinessError).data);
        default:
          businessError = error;
      }
    } else {
      businessError = error?.response?.status === 408
          ? new BusinessError(ErrorCode.TIMEOUT_ERROR, '请求超时')
          : new BusinessError(ErrorCode.NETWORK_ERROR, error.message);
    }
    this.modules.find(m => m instanceof ErrorHandler)?.onError?.(businessError as BusinessError);
  }
  use(module: RequestModule) {
    this.modules.push(module);
    return this;
  }
}



// 使用示例
const service = new AxiosService({
  baseURL: '/api',
  timeout: 10000,
});

service
  .use(new RequestDeduplicator())
  .use(new EncryptionHandler('casishandsomeboy'))
  .use(new CacheManager(new LRUCache({ // 缓存
    capacity: 50,
    maxAge: 1000 * 60
  })))
  .use(new ConcurrencyManager(8))
  .use(new AuthManager())
  .use(new ErrorHandler())

function request<T>(url:string,data?:any,config?:AxiosRequestConfig):Promise<T> {
  return service.request.post(url,data,config);
}

export default request;