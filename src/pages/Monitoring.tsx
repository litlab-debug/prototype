import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSurvey } from '@/context/SurveyContext';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw,
  Send,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Globe,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { CHANNEL_NAMES, Channel } from '@/types/survey';
import { useToast } from '@/hooks/use-toast';

export default function Monitoring() {
  const [searchParams] = useSearchParams();
  const preSelectedSurveyId = searchParams.get('surveyId');
  
  const { surveys, targets, responses, getTargetsForSurvey, getResponsesForSurvey, calculateNPS, sendReminders } = useSurvey();
  const { toast } = useToast();
  
  const [selectedSurveyId, setSelectedSurveyId] = useState(preSelectedSurveyId || '');
  const activeSurveys = surveys.filter(s => s.status === 'active');

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
  const surveyTargets = selectedSurveyId ? getTargetsForSurvey(selectedSurveyId) : targets;
  const surveyResponses = selectedSurveyId ? getResponsesForSurvey(selectedSurveyId) : responses;

  const nps = calculateNPS(surveyResponses);
  const responseRate = surveyTargets.length > 0
    ? Math.round((surveyResponses.length / surveyTargets.length) * 100)
    : 0;

  // Country breakdown
  const countryData = selectedSurvey?.countries.map(country => {
    const countryTargets = surveyTargets.filter(t => t.country === country);
    const countryResponses = surveyResponses.filter(r => r.country === country);
    const countryNPS = calculateNPS(countryResponses);
    return {
      country,
      targets: countryTargets.length,
      responses: countryResponses.length,
      rate: countryTargets.length > 0 ? Math.round((countryResponses.length / countryTargets.length) * 100) : 0,
      nps: countryNPS,
    };
  }) || [];

  // Channel breakdown
  const channelData = (['email', 'web', 'sms', 'phone'] as Channel[]).map(channel => {
    const channelTargets = surveyTargets.filter(t => t.channel === channel);
    const channelResponses = surveyResponses.filter(r => r.channel === channel);
    return {
      name: CHANNEL_NAMES[channel],
      targets: channelTargets.length,
      responses: channelResponses.length,
      rate: channelTargets.length > 0 ? Math.round((channelResponses.length / channelTargets.length) * 100) : 0,
    };
  }).filter(d => d.targets > 0);

  // Status distribution
  const statusData = [
    { name: 'Completed', value: surveyTargets.filter(t => t.status === 'completed').length, fill: 'hsl(var(--success))' },
    { name: 'Invited', value: surveyTargets.filter(t => t.status === 'invited').length, fill: 'hsl(var(--chart-1))' },
    { name: 'Reminded', value: surveyTargets.filter(t => t.status === 'reminded').length, fill: 'hsl(var(--warning))' },
    { name: 'Pending', value: surveyTargets.filter(t => t.status === 'pending').length, fill: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  // Simulated daily responses trend
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    responses: Math.floor(Math.random() * 50) + 10,
  }));

  const handleSendReminders = () => {
    if (!selectedSurveyId) {
      toast({ title: 'Error', description: 'Select a survey first', variant: 'destructive' });
      return;
    }
    const pendingTargets = surveyTargets.filter(t => t.status === 'invited' || t.status === 'pending');
    sendReminders(selectedSurveyId, pendingTargets.map(t => t.id));
    toast({ title: 'Success', description: `Reminders sent to ${pendingTargets.length} targets` });
  };

  return (
    <AppLayout title="Monitoring" description="Real-time survey operations monitoring">
      <div className="space-y-6 animate-fade-in">
        {/* Survey Selector and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
            <SelectTrigger className="sm:w-[350px]">
              <SelectValue placeholder="Select an active survey to monitor" />
            </SelectTrigger>
            <SelectContent>
              {activeSurveys.map(survey => (
                <SelectItem key={survey.id} value={survey.id}>
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSurveyId && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSendReminders}>
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </div>
          )}
        </div>

        {!selectedSurveyId ? (
          <Card className="enterprise-card">
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Select a Survey</h3>
              <p className="text-muted-foreground">
                Choose an active survey from the dropdown above to view real-time monitoring data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{nps}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {nps >= 50 ? 'Excellent' : nps >= 30 ? 'Good' : nps >= 0 ? 'Needs Improvement' : 'Critical'}
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{responseRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {surveyResponses.length} of {surveyTargets.length} targets
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {surveyTargets.filter(t => t.status === 'invited' || t.status === 'reminded').length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Awaiting response</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Days Remaining</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.max(0, Math.ceil((new Date(selectedSurvey!.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Until survey closes</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Response Trend */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Daily Response Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Line type="monotone" dataKey="responses" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Target Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Country Breakdown */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Response by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Targets</TableHead>
                      <TableHead className="text-right">Responses</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">NPS</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryData.map(row => (
                      <TableRow key={row.country}>
                        <TableCell className="font-medium">{row.country}</TableCell>
                        <TableCell className="text-right">{row.targets}</TableCell>
                        <TableCell className="text-right">{row.responses}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.rate >= 70 ? 'default' : row.rate >= 40 ? 'secondary' : 'outline'}>
                            {row.rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.nps >= 50 ? 'text-success' : row.nps >= 0 ? 'text-foreground' : 'text-destructive'}>
                            {row.nps}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey="responses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
