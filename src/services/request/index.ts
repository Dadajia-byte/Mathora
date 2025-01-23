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

  instance: AxiosInstance;
  private tokenStorage: TokenStorage;

  // 用于解决双token竞态问题
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(options:AxiosServiceOptions) {

    // 初始化实例
    this.instance = axios.create({
      baseURL: options.baseURL || import.meta.env.VITE_API_URL,
      timeout: options.timeout || 5000
    })

    // 初始化 Token 存储
    this.tokenStorage = options.tokenStorage || localStorageTokenStorage;

    // 初始化请求拦截器
    this.instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {

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

        return config
      },
      err => Promise.reject(err)
    )

    // 相应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      error => {
        return Promise.reject(error);
      }
    )
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

