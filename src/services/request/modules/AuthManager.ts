
import { AxiosRequestConfig, RequestModule } from '../type';
// Token认证模块
// src/services/request/modules/AuthModule.ts
export class AuthModule implements RequestModule {
  async onRequest(config: AxiosRequestConfig) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem(this.tokenStorageKey, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(this.tokenStorageKey);
  }

}
