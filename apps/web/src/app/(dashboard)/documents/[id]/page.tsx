'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ChatInterface } from '@/components/query/chat-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import type { Document } from '@/types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ documents: Document[] }>(`/api/documents`)
      .then((data) => {
        const found = data.documents.find((d) => d.id === id);
        setDoc(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton className="h-96 rounded-lg" />;

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg font-medium">Document not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{doc.filename}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatSize(doc.size_bytes)} &middot; {doc.page_count} pages
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <ChatInterface documentId={id} />
    </div>
  );
}
