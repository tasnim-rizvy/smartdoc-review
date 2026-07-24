'use client';

import { useDocuments } from '@/hooks/use-documents';
import { DocumentCard } from './document-card';
import { Skeleton } from '@/components/ui/skeleton';

export function DocumentList() {
  const { documents, loading, deleteDocument, refresh } = useDocuments();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg font-medium">No documents yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a PDF to start asking questions
        </p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
    } catch {
      // show error toast
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
      ))}
    </div>
  );
}
