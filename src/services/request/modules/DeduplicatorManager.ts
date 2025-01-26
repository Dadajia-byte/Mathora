import { RequestModule, AxiosRequestConfig, RequestServiceError, ErrorCode } from "../type";
// 请求去重模块
export class DeduplicatorManager implements RequestModule {
  private pending = new Map<string, AbortController>();

  async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const key = this.generateKey(config);
    if (this.pending.has(key)) return Promise.reject(new RequestServiceError(ErrorCode.DEDUPLICATOR, '重复操作过多'));
    const controller = new AbortController();
    config.signal = controller.signal;
    this.pending.set(key, controller);
    return config;
  }

  // 完成事件处理
  onCompleted(config: AxiosRequestConfig) {
    const key = this.generateKey(config);
    this.pending.delete(key); // 统一清理
  }

  /* onError(_error: RequestServiceError, config?: AxiosRequestConfig) {
  } */

  // 生成稳定的请求key
  private generateKey(config: AxiosRequestConfig): string { // 暂时只处理url和data 
    return `${config.url}-${typeof config.metaData ==='string'?config.metaData:JSON.stringify(config.metaData)}`;
  }
}
