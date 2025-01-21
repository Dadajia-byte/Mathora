import { InternalAxiosRequestConfig as OriginalAxiosRequestConfig } from 'axios';
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
}

export interface AxiosServiceOptions {
  baseURL?: string;
  timeout?: number;
  capacity?: number;
  maxAge?: number;
  maxRequestsCount?: number;
  tokenStorage?: TokenStorage;
}

// 定义 Token 存储接口
export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
}


// 错误类型分类
export enum ErrorType {
  NETWORK = 'API:NETWORK_ERROR',      // 网络错误
  CONCURRENT = 'API:CONCURRENT_ERROR',// 请求过多
  AUTH = 'API:UN_AUTH',            // 认证错误
  BUSINESS = 'API:BUSINESS_ERROR',    // 业务逻辑错误
  CACHE = 'API:CACHE_ERROR',          // 缓存错误（可选）
  UNKNOWN = 'API:UNKNOWN_ERROR',       // 未知错误
  TIMEOUT = 'API:TIMEOUT_ERROR',       // 请求超时
  VALIDATION = 'API:VALIDATION_ERROR'  // 参数校验错误
}

// 标准错误结构
export interface AppError extends Error {
  type: ErrorType;         // 错误类型
  code?: number;           // 错误码（可选）
  data?: any;              // 附加数据（可选）
  isCache?: boolean;       // 是否来自缓存（针对缓存场景）
}