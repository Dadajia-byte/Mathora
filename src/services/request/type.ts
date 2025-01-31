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
}

export interface AxiosServiceOptions {
  baseURL?: string;
  timeout?: number;
  capacity?: number;
  maxAge?: number;
  maxRequestsCount?: number;
}