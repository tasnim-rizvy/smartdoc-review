import { UploadDropzone } from '@/components/documents/upload-dropzone';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload PDF</h1>
        <p className="text-muted-foreground">Upload a PDF document to ask questions about it</p>
      </div>
      <UploadDropzone />
    </div>
  );
}
