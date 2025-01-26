import { URLMap } from "./type";
// 改用对象常量而非 enum，便于扩展动态逻辑
export const urlMap: URLMap = {
    test: "/test1",
    getUser: (params: { id: string }) => `/test${params.id}`,
    search: (params: { q: string; page?: number }) => 
        `/search?q=${encodeURIComponent(params.q)}&page=${params.page || 1}`
};