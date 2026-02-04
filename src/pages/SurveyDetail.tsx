import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSurvey } from '@/context/SurveyContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Send,
  Archive,
  Users,
  Calendar,
  Globe,
  Mail,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { LANGUAGE_NAMES, CHANNEL_NAMES, SurveyStatus } from '@/types/survey';
import { useToast } from '@/hooks/use-toast';

export default function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSurvey, getTargetsForSurvey, getResponsesForSurvey, publishSurvey, closeSurvey, calculateNPS } = useSurvey();

  const survey = getSurvey(id!);
  const targets = getTargetsForSurvey(id!);
  const responses = getResponsesForSurvey(id!);

  if (!survey) {
    return (
      <AppLayout title="Survey Not Found">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Survey not found</h2>
          <Button onClick={() => navigate('/surveys')}>Back to Surveys</Button>
        </div>
      </AppLayout>
    );
  }

  const nps = calculateNPS(responses);
  const responseRate = survey.targetCount > 0 
    ? Math.round((responses.length / survey.targetCount) * 100) 
    : 0;

  const statusData = [
    { name: 'Completed', value: targets.filter(t => t.status === 'completed').length, fill: 'hsl(var(--success))' },
    { name: 'Pending', value: targets.filter(t => t.status === 'pending').length, fill: 'hsl(var(--muted-foreground))' },
    { name: 'Invited', value: targets.filter(t => t.status === 'invited').length, fill: 'hsl(var(--chart-1))' },
    { name: 'Reminded', value: targets.filter(t => t.status === 'reminded').length, fill: 'hsl(var(--warning))' },
  ].filter(d => d.value > 0);

  const countryData = survey.countries.map(country => {
    const countryTargets = targets.filter(t => t.country === country);
    const countryResponses = responses.filter(r => r.country === country);
    return {
      name: country,
      targets: countryTargets.length,
      responses: countryResponses.length,
      rate: countryTargets.length > 0 ? Math.round((countryResponses.length / countryTargets.length) * 100) : 0,
    };
  });

  const getStatusBadge = (status: SurveyStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
    }
  };

  const handlePublish = () => {
    publishSurvey(survey.id);
    toast({ title: 'Success', description: 'Survey published successfully' });
  };

  const handleClose = () => {
    closeSurvey(survey.id);
    toast({ title: 'Success', description: 'Survey closed successfully' });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/respond/${survey.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Copied', description: 'Survey link copied to clipboard' });
  };

  return (
    <AppLayout title={survey.name} description={survey.description}>
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/surveys')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Button>
          <div className="flex gap-3">
            {survey.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => navigate(`/surveys/${survey.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handlePublish}>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </>
            )}
            {survey.status === 'active' && (
              <>
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => navigate(`/respond/${survey.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview Survey
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  <Archive className="h-4 w-4 mr-2" />
                  Close Survey
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(survey.status)}
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{nps}</div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{responseRate}%</div>
              <p className="text-xs text-muted-foreground">{responses.length} of {survey.targetCount} targets</p>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Survey Details */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Globe className="h-4 w-4" />
                  Languages
                </div>
                <div className="flex flex-wrap gap-1">
                  {survey.languages.map(lang => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {LANGUAGE_NAMES[lang]}
                      {lang === survey.primaryLanguage && ' (Primary)'}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  Channels
                </div>
                <div className="flex flex-wrap gap-1">
                  {survey.channels.map(channel => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {CHANNEL_NAMES[channel]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Globe className="h-4 w-4" />
                  Countries
                </div>
                <div className="flex flex-wrap gap-1">
                  {survey.countries.map(country => (
                    <Badge key={country} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Reminders
                </div>
                <p className="text-sm">
                  First: {survey.reminderSchedule.firstReminder} days before end<br />
                  Second: {survey.reminderSchedule.secondReminder} days before end
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Status */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Response Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
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
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Country */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Responses by Country</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="responses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate(`/targets?surveyId=${survey.id}`)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Targets ({survey.targetCount})
              </Button>
              <Button variant="outline" onClick={() => navigate(`/monitoring?surveyId=${survey.id}`)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Monitoring
              </Button>
              {survey.status === 'active' && (
                <Button variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
