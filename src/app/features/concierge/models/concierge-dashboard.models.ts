export interface ConciergeDashboardMetrics {
  activeVisits: number;
  pendingVisits: number;
  pendingPackages: number;
  activeResidents: number;
  activeUnits: number;
}

export interface ConciergeRecentActivity {
  type: 'VISIT' | 'PACKAGE' | 'RESIDENT' | 'UNIT';
  title: string;
  subtitle: string;
  status: string;
  occurredAt: string;
  route: string;
}

export interface ConciergeDashboard {
  metrics: ConciergeDashboardMetrics;
  recentActivity: ConciergeRecentActivity[];
  generatedAt: string;
}
