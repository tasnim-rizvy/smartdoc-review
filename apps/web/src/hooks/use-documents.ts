'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Document } from '@/types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ documents: Document[] }>('/api/documents');
      setDocuments(data.documents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const doc = await api.upload<Document>('/api/documents/upload', formData);
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await api.delete(`/api/documents/${id}`);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { documents, loading, error, uploadDocument, deleteDocument, refresh: fetchDocuments };
}
