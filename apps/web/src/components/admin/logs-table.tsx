'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { QueryLog, PaginatedResponse } from '@/types';

export function LogsTable() {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get<PaginatedResponse<QueryLog>>(`/api/admin/logs?page=${page}&limit=50`)
      .then((data) => {
        setLogs(data.data);
        setTotalPages(data.pagination.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-4">
      {loading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Rate Limited</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-mono text-xs">{log.user_id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs">{log.document_id.slice(0, 8)}...</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.prompt}</TableCell>
                  <TableCell>{log.tokens_used}</TableCell>
                  <TableCell>{log.latency_ms}ms</TableCell>
                  <TableCell>{log.rate_limited ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
