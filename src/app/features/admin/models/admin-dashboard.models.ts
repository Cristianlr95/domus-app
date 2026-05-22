export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  activeResidents: number;
  activeUnits: number;
  activeParkingSpots: number;
  activeStorages: number;
  pendingVisits: number;
  pendingPackages: number;
  unreadNotifications: number;
}

export interface AdminRecentActivity {
  entityType: string;
  entityId: string | null;
  action: string;
  summary: string;
  actorName: string;
  actorEmail: string | null;
  occurredAt: string;
}

export interface AdminDashboard {
  metrics: AdminDashboardMetrics;
  recentActivity: AdminRecentActivity[];
  generatedAt: string;
}
