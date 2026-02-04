import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Eye,
  History as HistoryIcon,
  TrendingUp,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function History() {
  const { surveys, responses, calculateNPS } = useSurvey();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const closedSurveys = surveys.filter(s => s.status === 'closed');
  const years = [...new Set(closedSurveys.map(s => new Date(s.endDate).getFullYear().toString()))];

  const filteredSurveys = closedSurveys.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || new Date(survey.endDate).getFullYear().toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  // NPS trend over time
  const trendData = closedSurveys
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .map(survey => {
      const surveyResponses = responses.filter(r => r.surveyId === survey.id);
      return {
        name: survey.name.length > 15 ? survey.name.slice(0, 15) + '...' : survey.name,
        date: new Date(survey.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        nps: calculateNPS(surveyResponses),
        responses: surveyResponses.length,
      };
    });

  const exportData = () => {
    const csv = [
      ['Survey Name', 'End Date', 'Targets', 'Responses', 'Response Rate', 'NPS'].join(','),
      ...filteredSurveys.map(s => {
        const surveyResponses = responses.filter(r => r.surveyId === s.id);
        const rate = s.targetCount > 0 ? Math.round((surveyResponses.length / s.targetCount) * 100) : 0;
        return [s.name, s.endDate, s.targetCount, surveyResponses.length, `${rate}%`, calculateNPS(surveyResponses)].join(',');
      }),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-history.csv';
    a.click();
  };

  // Calculate overall stats
  const totalResponses = closedSurveys.reduce((sum, s) => {
    return sum + responses.filter(r => r.surveyId === s.id).length;
  }, 0);
  const avgNPS = closedSurveys.length > 0
    ? Math.round(closedSurveys.reduce((sum, s) => {
        const surveyResponses = responses.filter(r => r.surveyId === s.id);
        return sum + calculateNPS(surveyResponses);
      }, 0) / closedSurveys.length)
    : 0;

  return (
    <AppLayout title="History" description="Historical survey data and analytics">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="enterprise-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <HistoryIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{closedSurveys.length}</p>
                  <p className="text-xs text-muted-foreground">Completed Surveys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalResponses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{avgNPS}</p>
                  <p className="text-xs text-muted-foreground">Average NPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{years.length}</p>
                  <p className="text-xs text-muted-foreground">Years of Data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NPS Trend Chart */}
        {trendData.length > 0 && (
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>NPS Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis domain={[-100, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Line type="monotone" dataKey="nps" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Survey Table */}
        <Card className="enterprise-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Targets</TableHead>
                  <TableHead className="text-right">Responses</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">NPS</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No completed surveys found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSurveys.map(survey => {
                    const surveyResponses = responses.filter(r => r.surveyId === survey.id);
                    const responseRate = survey.targetCount > 0
                      ? Math.round((surveyResponses.length / survey.targetCount) * 100)
                      : 0;
                    const nps = calculateNPS(surveyResponses);

                    return (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{survey.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {survey.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{survey.targetCount}</TableCell>
                        <TableCell className="text-right">{surveyResponses.length}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={responseRate >= 70 ? 'default' : responseRate >= 40 ? 'secondary' : 'outline'}>
                            {responseRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${nps >= 50 ? 'text-success' : nps >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                            {nps}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/surveys/${survey.id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
