'use client';

import Link from 'next/link';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DocumentCard({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-8 w-8 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/documents/${doc.id}`}
              className="font-medium hover:underline truncate block"
            >
              {doc.filename}
            </Link>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{formatSize(doc.size_bytes)}</span>
              <span>{doc.page_count} pages</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {doc.page_count > 0 ? 'Indexed' : 'Processing'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onDelete(doc.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
