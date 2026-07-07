// Lịch sử tìm kiếm lưu DB (đồng bộ web ↔ mobile). Cần đăng nhập.
import { apiDelete, apiGet, apiPost } from './api';

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

export const getSearchHistory = () => apiGet<SearchHistoryItem[]>('/search-history');
export const addSearchHistory = (query: string) => apiPost('/search-history', { query });
export const removeSearchHistory = (id: string) => apiDelete(`/search-history/${id}`);
export const clearSearchHistory = () => apiDelete('/search-history');
