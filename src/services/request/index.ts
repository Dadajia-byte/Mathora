import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AxiosServiceOptions,
  RequestModule,
  AxiosRequestConfig,
  AxiosResponse,
  ErrorCode,
  RequestServiceError,
  RequestError
} from './type';
import {
  // AuthManager,
  ConcurrencyManager,
  CacheManager,
  EncryptionManager,
  DeduplicatorManager,
  ErrorHandler,
  TransformURLManager
} from './modules/index';
import LRUCache from '@/utils/lru';
import { urlMap } from './enum';

class AxiosService {
  private instance: AxiosInstance;
  private modules: RequestModule[] = [];

  constructor(options: AxiosServiceOptions) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
      // 深拷贝原始数据（避免加密等操作污染原始数据）
      if (config.data) {
        config.metaData = JSON.parse(JSON.stringify(config.data));
      }
      // 按顺序执行模块请求逻辑
      for (const module of this.modules) {
        config = (await module.onRequest?.(config)) || config;
      }
      return config;
    });

    // 响应拦截器
    this.instance.interceptors.response.use(
      async (response: AxiosResponse) => {
        // 按顺序执行模块响应逻辑
        for (const module of this.modules) {
          response = (await module.onResponse?.(response)) || response;
        }

        // 业务状态码校验
        const { code, message, data } = response.data;
        if (code !== 10000) {
          throw new RequestServiceError(code, message, data, response.config);
        }

        this.triggerCompleted(response.config); // 成功响应了也要执行onCompleted钩子函数
        return response.data;
      },
      async (error: RequestError) => {
        this.triggerCompleted(error.config); // 确保错误时触发完成事件
        return this.errorHandler(error);
      }
    );
  }

  private errorHandler(error: AxiosError | RequestServiceError | RequestError): Promise<never> {
    let businessError: RequestServiceError;

    // 统一错误类型转换
    if (error instanceof RequestServiceError) {
      businessError = error;
    } else if (axios.isAxiosError(error)) {
      businessError = new RequestServiceError(
        error.response?.status === 408 ? ErrorCode.TIMEOUT_ERROR : ErrorCode.NETWORK_ERROR,
        error.message,
        error.response?.data,
        error.config
      );
    } else {
      businessError = new RequestServiceError(ErrorCode.UNKNOWN_ERROR, (error as any)?.message || 'Unknown error', undefined, undefined);
    }

    // 处理缓存命中特殊逻辑
    if (businessError.code === ErrorCode.CACHED) {
      return Promise.resolve(businessError.data) as Promise<never>;
    }

    // 触发全局错误处理器
    const errorHandlerModule = this.modules.find((m) => m instanceof ErrorHandler);
    errorHandlerModule?.onError?.(businessError);

    return Promise.reject(businessError);
  }

  private triggerCompleted(config?: AxiosRequestConfig): void {
    if (!config) return;
    this.modules.forEach((module) => module.onCompleted?.(config));
  }

  use(module: RequestModule): this {
    this.modules.push(module);
    return this;
  }

  get request(): AxiosInstance {
    return this.instance;
  }
}

// 使用示例（模块顺序优化）
const service = new AxiosService({
  baseURL: '/api',
  timeout: 10000,
});

service
  .use(new TransformURLManager(urlMap)) // 最好还是放路由和去重后面，但是目前有问题
  .use(new DeduplicatorManager())
  .use(new CacheManager(new LRUCache({ capacity: 50, maxAge: 1000 * 60 })))
  .use(new ConcurrencyManager(3))    
  .use(new EncryptionManager('casishandsomeboy'))
  // .use(new AuthManager())
  .use(new ErrorHandler());

export default function request<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.request.post(url, data, config);
}