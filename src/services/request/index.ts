import axios, { AxiosInstance, AxiosError, CanceledError } from 'axios';
import { AxiosServiceOptions, RequestModule, AxiosRequestConfig, AxiosResponse, ErrorCode,BusinessError } from './type';
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
    this.modules = option.modules || [];
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截链
    this.instance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      try {
        for (const module of this.modules) {
          config = await module.onRequest?.(config) || config;
        }
        return config;
      } catch (error: any) {
        return Promise.reject(new BusinessError(
          ErrorCode.UNKNOWN_ERROR,
          error.message
        ));
      }
    }
  );

    // 响应拦截链
    this.instance.interceptors.response.use(
    (response: AxiosResponse) => {
      this.modules.forEach(module => module.onResponse?.(response));
      const { code, message, data } = response.data;
      
      if (code !== 10000) {
        const error = new BusinessError(code, message, data);
        const handler = code === ErrorCode.UNAUTHORIZED 
          ? this.modules.find(m => m instanceof AuthManager)
          : this.modules.find(m => m instanceof ErrorHandler);
          
        handler?.onError?.(error);
        throw error;
      }
      return response.data;
    },
    (error: AxiosError) => {

      if (error instanceof CanceledError) {
        const abortError = new BusinessError(
          ErrorCode.ABORTED, 
          '请求已被取消',
          error.message
        );
        this.modules.find(m => m instanceof ErrorHandler)?.onError?.(abortError);
        return;
      }
      const businessError = error.response?.status === 408
        ? new BusinessError(ErrorCode.TIMEOUT_ERROR, '请求超时')
        : new BusinessError(ErrorCode.NETWORK_ERROR, error.message);
      
      this.modules.find(m => m instanceof ErrorHandler)?.onError?.(businessError);
      throw businessError;
    }
  );
  }
  get request() {
    return this.instance;
  }
}

// 使用示例
const service = new AxiosService({
  baseURL: '/api',
  timeout: 10000,
  modules: [ // 模块依次的顺序处理为 请求去重 -> 缓存 -> 加密 -> 并发控制 -> 双Token
    new RequestDeduplicator(), // 请求去重
     new CacheManager(new LRUCache({ // 缓存
      capacity: 50,
      maxAge: 1000 * 60
    })),
    new EncryptionHandler(import.meta.env.AES_KEY), // 加密
    new ConcurrencyManager(8), // 并发控制
    new AuthManager(), // 认证机制
    new ErrorHandler() // 仅负责事件转发
  ]
});

export default service.request;