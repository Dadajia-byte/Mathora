import { AxiosRequestConfig, RequestModule, AuthStrategy, RequestServiceError, ErrorCode } from "../type";
import events from '@/utils/events';
export class AuthManager implements RequestModule {
  private strategy: AuthStrategy;

  // 允许传入自定义策略
  constructor(strategy?: AuthStrategy) {
    this.strategy = strategy ?? this.createDefaultStrategy();
  }

  async onRequest(config: AxiosRequestConfig) {
    const credential = this.strategy.getCredential();
    
    if (!credential) {
      const handled = await this.strategy.onUnauthorized(
        new RequestServiceError(ErrorCode.UNAUTHORIZED, '未登录')
      );
      // 如果策略层未处理，抛出错误终止请求
      if (!handled) return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${credential}`;
    return config;
  }

  onError(error: RequestServiceError) {
    if (error.code === ErrorCode.UNAUTHORIZED) {
      this.strategy.onUnauthorized(error);
    }
  }

  // 默认策略实现
  private createDefaultStrategy(): AuthStrategy {
    return {
      getCredential: () => localStorage.getItem('token'),
      onUnauthorized: (error) => {
        localStorage.removeItem('token');
        events.emit('API:UN_AUTH', error);
        return false; // 不阻止默认错误传播
      }
    };
  }
}