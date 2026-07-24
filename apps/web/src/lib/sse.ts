import { API_URL } from './env';

export interface SSEEvents {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export function streamQuery(
  documentId: string,
  query: string,
  accessToken: string,
  events: SSEEvents,
): AbortController {
  const controller = new AbortController();

  fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ document_id: documentId, query }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Query failed' }));
        events.onError(err.message || `HTTP ${res.status}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        events.onError('No response body');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) events.onToken(parsed.token);
              if (parsed.done) events.onDone();
              if (parsed.error) events.onError(parsed.error);
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        events.onError(err.message);
      }
    });

  return controller;
}
