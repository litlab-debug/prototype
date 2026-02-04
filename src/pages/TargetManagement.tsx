import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSurvey } from '@/context/SurveyContext';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Upload,
  Send,
  Download,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { Target, LANGUAGE_NAMES, CHANNEL_NAMES, COUNTRIES, Language, Channel } from '@/types/survey';
import { useToast } from '@/hooks/use-toast';

export default function TargetManagement() {
  const [searchParams] = useSearchParams();
  const preSelectedSurveyId = searchParams.get('surveyId');
  
  const { surveys, targets, addTargets, sendReminders, getTargetsForSurvey } = useSurvey();
  const { toast } = useToast();
  
  const [selectedSurveyId, setSelectedSurveyId] = useState(preSelectedSurveyId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Target['status'] | 'all'>('all');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Omit<Target, 'id' | 'surveyId' | 'status'>[]>([]);

  const activeSurveys = surveys.filter(s => s.status !== 'closed');
  const surveyTargets = selectedSurveyId ? getTargetsForSurvey(selectedSurveyId) : targets;

  const filteredTargets = surveyTargets.filter(target => {
    const matchesSearch = target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || target.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Target['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case 'invited':
        return <Badge className="bg-primary/10 text-primary">Invited</Badge>;
      case 'reminded':
        return <Badge className="bg-warning/10 text-warning">Reminded</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'bounced':
        return <Badge variant="destructive">Bounced</Badge>;
    }
  };

  const toggleSelectTarget = (id: string) => {
    setSelectedTargets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTargets.length === filteredTargets.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(filteredTargets.map(t => t.id));
    }
  };

  const handleSendReminders = () => {
    if (selectedTargets.length === 0 || !selectedSurveyId) {
      toast({ title: 'Error', description: 'Select targets first', variant: 'destructive' });
      return;
    }
    sendReminders(selectedSurveyId, selectedTargets);
    toast({ title: 'Success', description: `Reminders sent to ${selectedTargets.length} targets` });
    setSelectedTargets([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate CSV parsing
    const mockData: Omit<Target, 'id' | 'surveyId' | 'status'>[] = [
      { email: 'john.doe@hospital.com', name: 'John Doe', company: 'City Hospital', country: 'United States', language: 'en', channel: 'email', segment: 'Enterprise' },
      { email: 'jane.smith@clinic.com', name: 'Jane Smith', company: 'Valley Clinic', country: 'United States', language: 'en', channel: 'email', segment: 'Mid-Market' },
      { email: 'hans.mueller@klinik.de', name: 'Hans Mueller', company: 'Berlin Klinik', country: 'Germany', language: 'de', channel: 'email', segment: 'Enterprise' },
      { email: 'marie.dupont@hopital.fr', name: 'Marie Dupont', company: 'Paris Hospital', country: 'France', language: 'fr', channel: 'email', segment: 'SMB' },
      { email: 'carlos.garcia@clinica.es', name: 'Carlos Garcia', company: 'Madrid Clinica', country: 'Spain', language: 'es', channel: 'email', segment: 'Mid-Market' },
    ];
    setCsvPreview(mockData);
    setUploadDialogOpen(true);
  };

  const confirmUpload = () => {
    if (!selectedSurveyId || csvPreview.length === 0) return;
    addTargets(selectedSurveyId, csvPreview);
    toast({ title: 'Success', description: `${csvPreview.length} targets added successfully` });
    setUploadDialogOpen(false);
    setCsvPreview([]);
  };

  const exportTargets = () => {
    const csv = [
      ['Email', 'Name', 'Company', 'Country', 'Language', 'Channel', 'Status'].join(','),
      ...filteredTargets.map(t => [t.email, t.name, t.company || '', t.country, t.language, t.channel, t.status].join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'targets.csv';
    a.click();
  };

  const statusCounts = {
    all: surveyTargets.length,
    pending: surveyTargets.filter(t => t.status === 'pending').length,
    invited: surveyTargets.filter(t => t.status === 'invited').length,
    reminded: surveyTargets.filter(t => t.status === 'reminded').length,
    completed: surveyTargets.filter(t => t.status === 'completed').length,
    bounced: surveyTargets.filter(t => t.status === 'bounced').length,
  };

  return (
    <AppLayout title="Target Management" description="Manage survey recipients and invitations">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <Card className="enterprise-card">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                <SelectTrigger className="lg:w-[300px]">
                  <SelectValue placeholder="Select a survey" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Surveys</SelectItem>
                  {activeSurveys.map(survey => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Target['status'] | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                  <SelectItem value="invited">Invited ({statusCounts.invited})</SelectItem>
                  <SelectItem value="reminded">Reminded ({statusCounts.reminded})</SelectItem>
                  <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                  <SelectItem value="bounced">Bounced ({statusCounts.bounced})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3">
            {selectedSurveyId && (
              <>
                <Button variant="outline" asChild>
                  <label>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  </label>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendReminders}
                  disabled={selectedTargets.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders ({selectedTargets.length})
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={exportTargets}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="enterprise-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.all}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.invited}</p>
                  <p className="text-xs text-muted-foreground">Invited</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.reminded}</p>
                  <p className="text-xs text-muted-foreground">Reminded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="enterprise-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.bounced}</p>
                  <p className="text-xs text-muted-foreground">Bounced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Targets Table */}
        <Card className="enterprise-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTargets.length === filteredTargets.length && filteredTargets.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTargets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No targets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTargets.slice(0, 50).map(target => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTargets.includes(target.id)}
                          onCheckedChange={() => toggleSelectTarget(target.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{target.name}</p>
                          <p className="text-sm text-muted-foreground">{target.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{target.company || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {target.country}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {CHANNEL_NAMES[target.channel]}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(target.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {target.completedAt 
                          ? new Date(target.completedAt).toLocaleDateString()
                          : target.remindedAt
                          ? new Date(target.remindedAt).toLocaleDateString()
                          : target.invitedAt
                          ? new Date(target.invitedAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filteredTargets.length > 50 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                Showing 50 of {filteredTargets.length} targets
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Targets</DialogTitle>
              <DialogDescription>
                Preview the targets to be imported. Click confirm to add them to the survey.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmUpload}>
                Import {csvPreview.length} Targets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
