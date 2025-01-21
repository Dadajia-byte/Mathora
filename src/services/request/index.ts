import axios, { AxiosInstance, AxiosResponse } from "axios"
import { AxiosRequestConfig, AxiosServiceOptions, TokenStorage, ErrorType, AppError } from "@/services/request/type"
import LRUCache from "@/utils/lru"
import secure from "@/utils/secure";
import { createError, handleError } from "./errorHandler";


// 默认基于 localStorage 的对双token存/取实现
const localStorageTokenStorage: TokenStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

class AxiosService {
  pendingRequests: Map<string, AbortController>;
  activeRequestsCount: number;
  maxRequestsCount: number;
  instance: AxiosInstance;
  cache: LRUCache;
  #aseKey: string;
  private tokenStorage: TokenStorage;

  // 用于解决双token竞态问题
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(options:AxiosServiceOptions) {
    // 初始化请求管理队列
    this.pendingRequests = new Map();

    // 初始化最大接口数量
    this.activeRequestsCount = 0;
    this.maxRequestsCount = options.maxRequestsCount || 10;

    // 初始化实例
    this.instance = axios.create({
      baseURL: options.baseURL || import.meta.env.VITE_API_URL,
      timeout: options.timeout || 5000
    })

    // 初始化 LRU 缓存
    this.cache = new LRUCache({ // 这里的缓存会被刷新，不是真正意义上的C端的缓存，所以缓存时间不需要太长，容量也不需要太大
      capacity: options.capacity || 50,
      maxAge: options.maxAge || 1000 * 60 * 5
    })

    // 初始化加密密钥 这里还是保存在客户端，不建议这样做，看看之后有没有好的处理
    this.#aseKey = import.meta.env.AES_KEY || 'chenanshuishandsomeboy';

    // 初始化 Token 存储
    this.tokenStorage = options.tokenStorage || localStorageTokenStorage;

    // 初始化请求拦截器
    this.instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // 同时请求过多拦截 
        if (this.activeRequestsCount >= this.maxRequestsCount) {
          return Promise.reject(
            createError('同时请求过多', ErrorType.CONCURRENT, { code: 10007 })
          );
        }

        this.removePendingRequest(config); // 移除重复请求

        // 缓存判断
        const cacheKey = this.generateRequestKey(config);
        if (config.cache && this.cache.has(cacheKey)) {
          const cachedResponse = this.cache.get(cacheKey);
          return Promise.resolve(cachedResponse);
        }

        this.addPendingRequest(config); // 添加请求至pengding队列

        // 加密处理
        if (config.encryption) {
          // 前端加密没什么用，而且耗费性能，所以一般来说还是不加密
          config = this.encryptRequest(config);
        }

        // 双 Token 判断逻辑
        const accessToken = this.tokenStorage.getAccessToken(); 
        const refreshToken = this.tokenStorage.getRefreshToken();

        if (refreshToken) { // 有刷新令牌 还要看有没有访问令牌
          if (accessToken) { // 如果有访问令牌，直接加入请求头
            // 这里有个问题，如果accessToken过期了怎么办呢？
            config.headers.Authorization = `Bearer ${accessToken}`;
          } else {
            if (this.isRefreshing) {
              // 如果正在刷新 token，其他请求等待
              return new Promise((resolve, _reject) => {
                this.refreshSubscribers.push((token: string) => {
                  config.headers.Authorization = `Bearer ${token}`;
                  resolve(config);
                });
              });
            }

            // 如果没有正在刷新，发起刷新 token 请求
            this.isRefreshing = true;
            try {
              const newAccessToken = await this.refreshToken(refreshToken);
              this.isRefreshing = false;

              // 刷新后的所有等待请求都会继续
              this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
              this.refreshSubscribers = []; // 清空队列

              config.headers.Authorization = `Bearer ${newAccessToken}`;
              return config;
            } catch (error) {
              this.isRefreshing = false;
              this.tokenStorage.clearTokens();
              return Promise.reject(createError('未找到刷新令牌', ErrorType.AUTH, { code: 10010 }));
            }
          }
        } else { // 没有刷新令牌，直接返回错误
          this.tokenStorage.clearTokens();
          return Promise.reject(createError('未找到刷新令牌', ErrorType.AUTH, { code: 10010 }));
        }

        this.activeRequestsCount++;
        return config
      },
      err => Promise.reject(err)
    )

    // 相应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.removePendingRequest(response.config);
        // 处理缓存标记
        if ((response.config as AxiosRequestConfig).cache) {
          const cacheKey = this.generateRequestKey(response.config);
          this.cache.set(cacheKey, {...response.data, _isCache: true});
        }
        this.activeRequestsCount--;

        // 处理后端返回错误（认证过期、业务逻辑错误、参数错误等错误，此类错误都看data内部code）
        const { code, message } = response.data;
        if (code !== 10000) { // 除了10000都是错误
          switch (code) {
            case 10010: // 无效的刷新令牌
            case 10011: // 访问令牌已过期
              return Promise.reject(createError(message, ErrorType.AUTH, { code }));
            default: // 其他暂时都归类为业务错误
              return Promise.reject(createError(message, ErrorType.BUSINESS, { code }));
          }
        }
        return response;
      },
      error => {
        // 统一转换错误
        this.removePendingRequest(error.config || {});
        this.activeRequestsCount--;
        handleError(error);
        return Promise.reject(error);
      }
    )
  }

  // 生成稳定的请求key
  private generateRequestKey(config: AxiosRequestConfig): string {
    const stableStringify = (obj: any): string => {
      if (obj === null || obj === undefined) return 'null';
      if (typeof obj !== 'object') return JSON.stringify(obj);
      if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
      const keys = Object.keys(obj).sort();
      return `{${keys.map(k => `"${k}":${stableStringify(obj[k])}`).join(',')}}`;
    };
    return `${config.url}-${stableStringify(config.params)}-${stableStringify(config.data)}`;
  }
  // 加密请求数据
  encryptRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const { method, encryptWholeMessage, encryptFields } = config.encryption!;
    let aesIV: string | undefined;
    // 目前默认如果选择AES加密，则默认就是AES的cbc模式
    if(method === 'AES') {
      aesIV = secure.generateIV();
      config.headers = config.headers || {};
      config.headers['X-AES-IV'] = aesIV; // 如果是AES的cbc模式要将iv传递给后端
    }
    if (encryptWholeMessage) { // 加密整个报文
      config.data = this.encryptData(config.data, method, aesIV);
    } else if (encryptFields && encryptFields.length > 0) { // 加密指定字段
      encryptFields.forEach(field => {
        if (config.data[field]) {
          config.data[field] = this.encryptData(config.data[field], method, aesIV);
        }
      });
    }
    return config;
  }

  // 加密数据
  encryptData(data: any, method: 'AES' | 'RSA', aesIV?:string): any {
    try {
      if (method === 'AES') {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        const encrypted = secure.encodeAES(dataStr, this.#aseKey, aesIV);
        return encrypted;
      } else if (method === 'RSA') {
        /* 暂时不做RSA加密，我还没搞得特别懂 */
      }
      return data;
    } catch (e) {
      console.error('数据加密错误:', e);
      throw e;
    }
  }

  // pending请求队列，避免重复请求
  addPendingRequest(config:AxiosRequestConfig) {
    const key = this.generateRequestKey(config);
    if (this.pendingRequests.has(key)) {
      const controller = this.pendingRequests.get(key);
      controller?.abort('请求取消，重复亲切感');
    } 
    const controller = new AbortController();
    config.signal = controller.signal;
    this.pendingRequests.set(key, controller);
  }
  // 移除请求队列
  removePendingRequest(config:AxiosRequestConfig) {
    const key = this.generateRequestKey(config);
    if (this.pendingRequests.has(key)) {
      const controller = this.pendingRequests.get(key);
      controller?.abort('请求取消');
      this.pendingRequests.delete(key);
    }
  }

  // 修改后的 refreshToken 方法
  private async refreshToken(refreshToken:string): Promise<string> {
    // token是否前端加密也是一个值得考量的事，暂时不做
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    const { code, message, data } = response.data;
    if (code === 10010 || code === 10011) {
      return Promise.reject(createError(message, ErrorType.AUTH, { code }))
    }
    this.tokenStorage.setTokens(data.accessToken, data.refreshToken); // 每次请求都会刷新refreshtoken，所以要重新记录
    return data.accessToken;
  }

}

const options = {
  baseURL: '/api',
  timeout: 5000,
  // capacity:50, // 开启缓存后，缓存数量
  // maxAge:1000*60*5 // 开启缓存后，缓存生命周期
  // maxRequestsCount:5, // 最大同时发送接口数
  // tokenStorage: localStorageTokenStorage // 自定义 Token 存储
}

export const createRequest = (options:AxiosServiceOptions):AxiosService => {
  return new AxiosService(options)
}

export const request = createRequest(options).instance;

