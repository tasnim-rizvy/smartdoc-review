'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users, FileText, Clock, Zap } from 'lucide-react';
import type { AdminStats } from '@/types';

export function StatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AdminStats>('/api/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { title: 'Total Queries', value: stats.totalQueries.toLocaleString(), icon: MessageSquare },
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users },
    { title: 'Total Documents', value: stats.totalDocuments.toLocaleString(), icon: FileText },
    { title: 'Avg Latency', value: `${stats.avgLatencyMs}ms`, icon: Clock },
    { title: 'Total Tokens', value: stats.totalTokensUsed.toLocaleString(), icon: Zap },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
