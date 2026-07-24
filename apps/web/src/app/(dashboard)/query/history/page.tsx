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
import type { QueryLog } from '@/types';

export default function QueryHistoryPage() {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ logs: QueryLog[]; pagination: { page: number; pages: number; total: number } }>(
        `/api/query/history?page=${page}&limit=20`,
      )
      .then((data) => {
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Query History</h1>
        <p className="text-muted-foreground">Your past questions and answers</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No queries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask a question about a document to see it here
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {log.prompt}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {log.response_preview}
                  </TableCell>
                  <TableCell>{log.tokens_used}</TableCell>
                  <TableCell>{log.latency_ms}ms</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString()}
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
