'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  FileText,
  Upload,
  History,
  BarChart3,
  ScrollText,
  Home,
} from 'lucide-react';

const links = [
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/documents/upload', label: 'Upload PDF', icon: Upload },
  { href: '/query/history', label: 'Query History', icon: History },
];

const adminLinks = [
  { href: '/admin', label: 'Stats', icon: BarChart3 },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <nav className="flex-1 space-y-1 p-4">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
            pathname === '/' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
              pathname === link.href || pathname.startsWith(link.href + '/')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-medium text-muted-foreground">Admin</p>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                  pathname === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
