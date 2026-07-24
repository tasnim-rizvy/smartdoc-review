import { DocumentList } from '@/components/documents/document-list';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">All your uploaded PDFs</p>
      </div>
      <DocumentList />
    </div>
  );
}
