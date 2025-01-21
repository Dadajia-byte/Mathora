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
  NETWORK = 'network',      // 网络错误
  CONCURRENT = 'concurrent',// 请求过多
  AUTH = 'auth',            // 认证错误
  BUSINESS = 'business',    // 业务逻辑错误
  CACHE = 'cache',          // 缓存错误（可选）
  UNKNOWN = 'unknown'       // 未知错误
}

// 标准错误结构
export interface AppError extends Error {
  type: ErrorType;         // 错误类型
  code?: number;           // 错误码（可选）
  data?: any;              // 附加数据（可选）
  isCache?: boolean;       // 是否来自缓存（针对缓存场景）
}