'use client';

import { useState } from 'react';
import { useSSEStream } from '@/hooks/use-sse-stream';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Square, Loader2 } from 'lucide-react';

export function ChatInterface({ documentId }: { documentId: string }) {
  const [query, setQuery] = useState('');
  const { fullResponse, isStreaming, error, startStream, cancelStream, reset } = useSSEStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;
    startStream(documentId, query);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>Ask a Question</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/30 p-4 mb-4">
          {!fullResponse && !error && !isStreaming && (
            <p className="text-sm text-muted-foreground text-center mt-20">
              Ask a question about your document to get started
            </p>
          )}
          {fullResponse && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Answer:</p>
              <p className="text-sm whitespace-pre-wrap">{fullResponse}</p>
              {isStreaming && (
                <span className="inline-block animate-pulse text-muted-foreground">▊</span>
              )}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question..."
            className="min-h-[60px] resize-none"
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-1">
            {isStreaming ? (
              <Button type="button" variant="destructive" size="icon" onClick={cancelStream}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!query.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
