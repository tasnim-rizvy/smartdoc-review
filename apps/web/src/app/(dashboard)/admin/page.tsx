import { StatsCards } from '@/components/admin/stats-cards';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide usage statistics</p>
      </div>
      <StatsCards />
    </div>
  );
}
