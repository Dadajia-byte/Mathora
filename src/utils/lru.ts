interface LRUCacheOptions {
  capacity: number;
  maxAge: number;
}

// 这里手写了一个简易的LRU，就不在引入相关依赖了
class LRUCache {
  #map: Map<string, string>;
  #capacity;
  #maxAge;

  constructor({ capacity, maxAge }: LRUCacheOptions) {
    this.#capacity = capacity;
    this.#maxAge = maxAge;
    this.#map = new Map();
  }

  get(key:string):any {
    const item = this.#map.get(key);
    if (!item) {
      return undefined;
    }
    // 序列化和反序列化存储的数据（内部包含时间戳的，不确定是否会有问题，后期万一value包含function等其他类型也不确定是否会出错）
    const parsedItem = JSON.parse(item);
    if (Date.now() - parsedItem.timestamp > this.#maxAge) {
      this.#map.delete(key);
      return undefined;
    }
    this.#map.delete(key)
    this.#map.set(key, item)
    return parsedItem.value;
  }

  set(key: string, value: any) {
    if (this.#map.has(key)) {
      this.#map.delete(key);
    }
    const item = JSON.stringify({ value, timestamp: Date.now() });
    this.#map.set(key, item);
    // 超容量，清队头
    if (this.#map.size > this.#capacity) {
      const firstKey = this.#map.keys().next().value;
      if (firstKey !== undefined) {
        this.#map.delete(firstKey);
      }
    }
  }
  has(key: string): boolean {
    const item = this.#map.get(key);
    if (!item) {
      return false;
    }
    const parsedItem = JSON.parse(item);
    if (Date.now() - parsedItem.timestamp > this.#maxAge) {
      this.#map.delete(key);
      return false;
    }
    return true;
  }

  clear() {
    this.#map.clear();
  }
}

export default LRUCache;