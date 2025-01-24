import { RequestModule, AxiosRequestConfig, AxiosResponse } from "../type";
// 并发控制模块
export class ConcurrencyManager implements RequestModule {
  private queue: (() => void)[] = [];
  private activeCount = 0;

  constructor(private max: number) {}

  async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (this.activeCount < this.max) {
      this.activeCount++;
      return config;
    }

    return new Promise(resolve => {
      this.queue.push(() => {
        this.activeCount++;
        resolve(config);
      });
    });
  }

  onResponse(response: AxiosResponse): AxiosResponse {
    this.activeCount = Math.max(0, this.activeCount - 1); // 高并发场景下，防止并发数为负数
    this.queue.shift()?.();
    return response;
  }
}