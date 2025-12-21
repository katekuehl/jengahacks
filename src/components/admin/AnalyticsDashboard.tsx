import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface RegistrationStats {
  total: number;
  withLinkedIn: number;
  withWhatsApp: number;
  withResume: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  dailyTrends?: Array<{ date: string; count: number }>;
  hourlyDistribution?: Array<{ hour: number; count: number }>;
}

interface AnalyticsDashboardProps {
  stats: RegistrationStats;
}

const COLORS = ["#65bb3a", "#8b5cf6", "#3b82f6", "#f59e0b"];

const AnalyticsDashboard = ({ stats }: AnalyticsDashboardProps) => {
  // Prepare data for charts
  const completionData = [
    { name: "With Resume", value: stats.withResume, percentage: stats.total > 0 ? Math.round((stats.withResume / stats.total) * 100) : 0 },
    { name: "With WhatsApp", value: stats.withWhatsApp, percentage: stats.total > 0 ? Math.round((stats.withWhatsApp / stats.total) * 100) : 0 },
    { name: "With LinkedIn", value: stats.withLinkedIn, percentage: stats.total > 0 ? Math.round((stats.withLinkedIn / stats.total) * 100) : 0 },
  ];

  const timeSeriesData = [
    { period: "Today", count: stats.today },
    { period: "This Week", count: stats.thisWeek },
    { period: "This Month", count: stats.thisMonth },
    { period: "Total", count: stats.total },
  ];

  const pieData = [
    { name: "Complete Profile", value: stats.withResume + stats.withWhatsApp + stats.withLinkedIn },
    { name: "Basic Profile", value: stats.total - (stats.withResume + stats.withWhatsApp + stats.withLinkedIn) },
  ];

  // Prepare daily trends data (last 30 days)
  const dailyTrendsData = stats.dailyTrends || [];
  
  // Prepare hourly distribution data
  const hourlyData = stats.hourlyDistribution || Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Registrations with additional information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completionData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#65bb3a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Types</CardTitle>
            <CardDescription>Distribution of profile completeness</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends Chart */}
      {dailyTrendsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Registration Trends</CardTitle>
            <CardDescription>Registrations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#65bb3a" 
                  strokeWidth={2}
                  dot={{ fill: '#65bb3a', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Hourly Distribution */}
      {hourlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hourly Registration Distribution</CardTitle>
            <CardDescription>When do people register? (24-hour format)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Hour: ${value}:00`}
                  formatter={(value: number) => [value, 'Registrations']}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
          <CardDescription>Comprehensive registration analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Resume Upload Rate</p>
              <p className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.withResume / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">WhatsApp Provided</p>
              <p className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.withWhatsApp / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">LinkedIn Provided</p>
              <p className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.withLinkedIn / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;

