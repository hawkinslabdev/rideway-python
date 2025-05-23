import { StatsCards } from '@/components/dashboard/stats-cards'
import { UpcomingMaintenance } from '@/components/dashboard/upcoming-maintenance'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your motorcycle maintenance and activities
        </p>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingMaintenance />
        <RecentActivity />
      </div>
    </div>
  )
}