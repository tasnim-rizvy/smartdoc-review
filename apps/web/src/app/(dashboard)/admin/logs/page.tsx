import { LogsTable } from '@/components/admin/logs-table';

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">All query logs across the system</p>
      </div>
      <LogsTable />
    </div>
  );
}
