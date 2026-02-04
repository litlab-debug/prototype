import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSurvey } from '@/context/SurveyContext';
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  History as HistoryIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';

export default function Dashboard() {
  const { surveys, responses, targets, getMetrics, calculateNPS } = useSurvey();
  const navigate = useNavigate();
  const metrics = getMetrics();

  const activeSurveys = surveys.filter(s => s.status === 'active');
  const recentResponses = responses.slice(-10);

  // NPS by survey data
  const npsData = surveys
    .filter(s => s.status !== 'draft')
    .map(survey => {
      const surveyResponses = responses.filter(r => r.surveyId === survey.id);
      return {
        name: survey.name.length > 20 ? survey.name.slice(0, 20) + '...' : survey.name,
        nps: calculateNPS(surveyResponses),
        responses: surveyResponses.length,
      };
    });

  // Response rate by channel
  const channelData = [
    { name: 'Email', value: targets.filter(t => t.channel === 'email').length, fill: 'hsl(var(--chart-1))' },
    { name: 'Web', value: targets.filter(t => t.channel === 'web').length, fill: 'hsl(var(--chart-2))' },
    { name: 'SMS', value: targets.filter(t => t.channel === 'sms').length, fill: 'hsl(var(--chart-3))' },
    { name: 'Phone', value: targets.filter(t => t.channel === 'phone').length, fill: 'hsl(var(--chart-4))' },
  ].filter(d => d.value > 0);

  // Monthly trend (simulated)
  const trendData = [
    { month: 'Sep', nps: 42, responses: 245 },
    { month: 'Oct', nps: 45, responses: 312 },
    { month: 'Nov', nps: 48, responses: 398 },
    { month: 'Dec', nps: 52, responses: 456 },
    { month: 'Jan', nps: 50, responses: 423 },
    { month: 'Feb', nps: metrics.averageNPS, responses: metrics.totalResponses },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout title="Dashboard" description="Executive overview of customer satisfaction">
      <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average NPS
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.averageNPS}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5 from last quarter
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Response Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.responseRate}%</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Surveys
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.activeSurveys}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.totalSurveys} total surveys
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Responses
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.totalResponses.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg. {Math.round(metrics.averageCompletionTime / 60)}min completion
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* NPS Trend */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-lg">NPS Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nps"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channel Distribution */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-lg">Distribution by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 -mt-4">
                  {channelData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Surveys and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Surveys */}
          <Card className="enterprise-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Active Surveys</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/surveys')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSurveys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active surveys</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/surveys/create')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Survey
                    </Button>
                  </div>
                ) : (
                  activeSurveys.slice(0, 4).map((survey) => {
                    const surveyResponses = responses.filter(r => r.surveyId === survey.id);
                    const responseRate = survey.targetCount > 0
                      ? Math.round((surveyResponses.length / survey.targetCount) * 100)
                      : 0;

                    return (
                      <div
                        key={survey.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/surveys/${survey.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{survey.name}</h4>
                            {getStatusBadge(survey.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {survey.targetCount} targets
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {surveyResponses.length} responses
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Ends {new Date(survey.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">
                            {calculateNPS(surveyResponses)}
                          </div>
                          <div className="text-xs text-muted-foreground">NPS</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => navigate('/surveys/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Survey
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/targets')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Targets
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/monitoring')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Monitoring
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/history')}
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                Survey History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* NPS by Survey */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-lg">NPS by Survey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[-100, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="nps" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
