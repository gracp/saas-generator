'use client';

import { FolderKanban, Rocket, Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
}

interface StatsHeaderProps {
  projects: ProjectSummary[];
}

export function StatsHeader({ projects }: StatsHeaderProps) {
  const total = projects.length;
  const live = projects.filter((p) => p.status === 'live').length;
  const building = projects.filter((p) =>
    ['researching', 'generating_ideas', 'building', 'reviewing', 'deploying'].includes(p.status)
  ).length;

  const stats = [
    { label: 'Total Projects', value: total, icon: FolderKanban, className: 'text-zinc-400' },
    { label: 'Live', value: live, icon: Rocket, className: 'text-emerald-400' },
    { label: 'Building', value: building, icon: Hammer, className: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-row items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 ${stat.className}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="truncate text-xs text-zinc-500">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
