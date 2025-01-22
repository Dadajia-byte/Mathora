
import { AxiosRequestConfig, RequestModule,BusinessError,ErrorCode } from '../type';
import events from '@/utils/events';
// 认证模块
export class AuthManager implements RequestModule {
  async onRequest(config: AxiosRequestConfig) {
    const token = localStorage.getItem('token');
    if (!token) {
      events.emit('API:UN_AUTH');
      return Promise.reject(new BusinessError(ErrorCode.UNAUTHORIZED, '未登录'));
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  onError(error: BusinessError) {
    if (error.code === ErrorCode.UNAUTHORIZED) {
      events.emit('API:UN_AUTH', error);
      this.clearAuth();
    }
  }

  private clearAuth() {
    localStorage.removeItem('token');
  }
}
