export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  filepath: string;
  size_bytes: number;
  page_count: number;
  created_at: string;
}

export interface QueryLog {
  _id: string;
  user_id: string;
  document_id: string;
  prompt: string;
  response_preview: string;
  tokens_used: number;
  latency_ms: number;
  chunks_retrieved: number;
  rate_limited: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStats {
  totalQueries: number;
  totalUsers: number;
  totalDocuments: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
  queriesPerDay: { _id: string; count: number }[];
}

export interface SSEToken {
  token?: string;
  done?: boolean;
  error?: string;
}
