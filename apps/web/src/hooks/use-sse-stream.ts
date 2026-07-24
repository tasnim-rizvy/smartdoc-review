'use client';

import { useState, useRef, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';
import { streamQuery } from '@/lib/sse';

export function useSSEStream() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback((documentId: string, query: string) => {
    const token = getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsStreaming(true);
    setError(null);
    setIsComplete(false);
    setTokens([]);

    controllerRef.current = streamQuery(documentId, query, token, {
      onToken: (text) => setTokens((prev) => [...prev, text]),
      onDone: () => {
        setIsStreaming(false);
        setIsComplete(true);
      },
      onError: (msg) => {
        setError(msg);
        setIsStreaming(false);
        setIsComplete(true);
      },
    });
  }, []);

  const cancelStream = useCallback(() => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const fullResponse = tokens.join('');
  const reset = useCallback(() => {
    setTokens([]);
    setError(null);
    setIsStreaming(false);
    setIsComplete(false);
  }, []);

  return { tokens, fullResponse, isStreaming, error, isComplete, startStream, cancelStream, reset };
}
