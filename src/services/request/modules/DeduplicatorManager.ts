import { RequestModule, AxiosRequestConfig, AxiosResponse, BusinessError, ErrorCode } from "../type";
// 请求去重模块
export class DeduplicatorManager implements RequestModule {
  private pending = new Map<string, AbortController>();

  async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const key = this.generateKey(config);
    if (this.pending.has(key)) {
      return Promise.reject(new BusinessError(ErrorCode.DEDUPLICATOR, '重复操作过多'));
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


  private generateKey(config: AxiosRequestConfig): string { // 暂时只处理url和data
    return `${config.url}-${typeof config.data ==='string'?config.data:JSON.stringify(config.data)}`;
  }
}
