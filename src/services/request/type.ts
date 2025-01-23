import { Axios, InternalAxiosRequestConfig as OriginalAxiosRequestConfig, AxiosResponse as OriginalAxiosResponse, AxiosError } from 'axios';
// 加密模块
export interface EncryptionOptions {
  method: 'AES' | 'RSA'; // 支持的加密方式（暂时只支持AES的cbc模式）
  encryptWholeMessage?: boolean; // 是否加密整个报文
  encryptFields?: string[]; // 需要加密的字段
}

export interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
  cache?: boolean;
  encryption?: EncryptionOptions;
  _retry?: boolean;
  __fromCache?: boolean;
}

export interface AxiosResponse extends OriginalAxiosResponse {
  config: AxiosRequestConfig;
}

export interface AxiosServiceOptions {
  baseURL?: string;
  timeout?: number;
  modules?: RequestModule[];
}

// 定义 Token 存储接口
export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
}


export enum ErrorCode {
  UNAUTHORIZED = 10001,
  VALIDATION_ERROR = 10003,
  BUSINESS_ERROR = 10004,
  NETWORK_ERROR = 10005,
  TIMEOUT_ERROR = 10006,
  UNKNOWN_ERROR = 10007,
  ABORTED = 10008, // 请求取消错误码
  CACHED = 10009 // 缓存命中错误码
}
export class BusinessError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// 错误分三类：业务错误(包括缓存命中)、axios自带错误（网络、未知等）
export type Error = BusinessError | AxiosError 

export interface RequestModule {
  onRequest?: (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
  onResponse?: (response: AxiosResponse) => AxiosResponse;
  onError?: (error: BusinessError, config?: AxiosRequestConfig) => void;
}