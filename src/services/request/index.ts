import axios, { AxiosInstance, AxiosResponse } from "axios"
import { AxiosRequestConfig, AxiosServiceOptions, TokenStorage } from "@/services/request/type"
import LRUCache from "@/utils/lru"
import secure from "@/utils/secure";

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
  }
};

class AxiosService {
  pendingRequests: Map<string, Function>;
  activeRequestsCount: number;
  maxRequestsCount: number;
  instance: AxiosInstance;
  cache: LRUCache;
  #aseKey: string;

  // 双token相关
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private tokenStorage: TokenStorage;

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
      (config: AxiosRequestConfig) => {
        // 同时请求过多拦截 
        if (this.activeRequestsCount >= this.maxRequestsCount) {
          return Promise.reject(`同时请求过多请稍后再试`)
        }

        this.removePendingRequest(config); // 移除重复请求
        this.addPendingRequest(config); // 添加请求至pengding队列

        // 缓存判断
        if (config.cache && config.url && this.cache.get(config.url)) {
          return Promise.resolve(this.cache.get(config.url))
        }

        // 加密处理
        if (config.encryption) {
          // 前端加密其实没什么用，而且耗费性能，所以一般来说还是不加密
          config = this.encryptRequest(config);
        }

        // 双 Token 判断逻辑
        const accessToken = this.tokenStorage.getAccessToken();
        const refreshToken = this.tokenStorage.getRefreshToken();

        // 添加 Authorization 头
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          return this.verifyAndRefreshToken(config);
        }

        if (refreshToken) {
          return this.handleTokenRefresh(config);
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
        // 缓存处理
        if ((response.config as AxiosRequestConfig).cache) { // 在接口中增加cache字段主动开启缓存
          this.cache.put(response.config.url!, response.data);
        }
        this.activeRequestsCount--;
        return response;
      },
      error => {
        this.removePendingRequest(error.config || {});
        this.activeRequestsCount--;
        const originalRequest = error.config;
        
        // Token 过期处理（401 状态码）
        if (error.response?.status === 401 && !originalRequest._retry) {
          return this.handleAuthError(originalRequest);
        }
        return Promise.reject(error)
      }
    )
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
    const key = `${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
    if (this.pendingRequests.has(key)) {
      config.cancelToken = new axios.CancelToken(cancel => cancel(`请求取消`))
    } else {
      config.cancelToken = new axios.CancelToken(cancel => {
        this.pendingRequests.set(key, cancel)
      });
    }
  }
  // 移除请求队列
  removePendingRequest(config:AxiosRequestConfig) {
    const key = `${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
    if (this.pendingRequests.has(key)) {
      const cancel = this.pendingRequests.get(key);
      if (cancel) {
        cancel(key);
      }
      this.pendingRequests.delete(key);
    }
  }

  // 验证并刷新 Token
  private async verifyAndRefreshToken(config: AxiosRequestConfig) {
    try {
      // 简单验证 Token 是否即将过期（生产环境应使用 JWT 解码验证）
      if (this.isTokenExpired()) {
        return this.handleTokenRefresh(config);
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // 处理 Token 刷新
  private async handleTokenRefresh(config: AxiosRequestConfig) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const newAccessToken = await this.refreshToken();
        this.tokenStorage.setTokens(newAccessToken);
        
        // 执行等待中的请求
        this.refreshSubscribers.forEach(callback => callback(newAccessToken));
        this.refreshSubscribers = [];
        
        // 重试原始请求
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return config;
      } catch (error) { // 刷新 Token 失败，跳转登录页

        // 这里后期可能写一个auth高阶组件，用于处理登录过期跳转

        this.tokenStorage.clearTokens();
        window.location.href = '/login';
        
        
        return Promise.reject(error);
      } finally {
        this.isRefreshing = false;
      }
    }

    // 如果已经在刷新中，返回一个等待 Promise
    return new Promise((resolve) => {
      this.refreshSubscribers.push((newToken) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(config);
      });
    });
  }

  // 处理认证错误
  private async handleAuthError(originalRequest: AxiosRequestConfig) {
    originalRequest._retry = true;
    
    try {
      const newAccessToken = await this.refreshToken();
      this.tokenStorage.setTokens(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return this.instance(originalRequest);
    } catch (error) {
      // 这里后期可能写一个auth高阶组件，用于处理登录过期跳转

        this.tokenStorage.clearTokens();
        window.location.href = '/login';
        
        
        return Promise.reject(error);
    }
  }

  // 修改后的 refreshToken 方法
  private async refreshToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // token是否前端加密也是一个值得考量的事，暂时不做
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      { refreshToken },
    );

    if (!response.data.accessToken) {
      throw new Error('Invalid refresh token response');
    }

    return response.data.accessToken;
  }

  // 新增方法：简单 Token 过期检查（生产环境需要更完整实现）
  private isTokenExpired(): boolean {
    // 这里可以添加实际的 JWT 过期时间检查逻辑
    // 示例：检查 localStorage 中的过期时间戳
    const expiryTime = localStorage.getItem('tokenExpiry');
    return expiryTime ? Date.now() > parseInt(expiryTime) : false;
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

