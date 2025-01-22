import { RequestModule, AxiosRequestConfig, AxiosResponse } from "../type";
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

  onResponse(response: AxiosResponse) {
    const key = this.generateKey(response.config);
    this.pending.delete(key);
  }

  // 生成稳定的请求key
    private generateKey(config: AxiosRequestConfig): string {
      const stableStringify = (obj: any): string => {
        if (obj === null || obj === undefined) return 'null';
        if (typeof obj !== 'object') return JSON.stringify(obj);
        if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
        const keys = Object.keys(obj).sort();
        return `{${keys.map(k => `"${k}":${stableStringify(obj[k])}`).join(',')}}`;
      };
      return `${config.url}-${stableStringify(config.params)}-${stableStringify(config.data)}`;
    }
}
