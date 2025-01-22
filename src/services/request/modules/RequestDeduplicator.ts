import { RequestModule, AxiosRequestConfig, AxiosResponse,BusinessError } from "../type";
// 请求去重模块
export class RequestDeduplicator implements RequestModule {
  private pending = new Map<string, AbortController>();

  async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const key = this.generateKey(config);
    
    if (this.pending.has(key)) {
      this.pending.get(key)?.abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    this.pending.set(key, controller);
    
    return config;
  }

  onResponse(response: AxiosResponse):AxiosResponse {
    const key = this.generateKey(response.config);
    this.pending.delete(key);
    return response;
  }

  /* onError(_error: BusinessError, config?: AxiosRequestConfig) {
  } */


 private generateKey(config: AxiosRequestConfig): string {
    return `${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
  }
}
