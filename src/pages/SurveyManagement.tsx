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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSurvey } from '@/context/SurveyContext';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Send,
  Copy,
  Archive,
  FileText,
  Users,
  Calendar,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SurveyStatus } from '@/types/survey';

export default function SurveyManagement() {
  const { surveys, deleteSurvey, publishSurvey, closeSurvey, responses, calculateNPS } = useSurvey();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const handleDelete = (id: string) => {
    setSurveyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (surveyToDelete) {
      deleteSurvey(surveyToDelete);
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    }
  };

  const handlePublish = (id: string) => {
    publishSurvey(id);
  };

  const handleClose = (id: string) => {
    closeSurvey(id);
  };

  return (
    <AppLayout title="Surveys" description="Manage all customer satisfaction surveys">
      <div className="space-y-6 animate-fade-in">
        {/* Filters and Actions */}
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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SurveyStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => navigate('/surveys/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </div>

        {/* Survey Cards */}
        {filteredSurveys.length === 0 ? (
          <Card className="enterprise-card">
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No surveys found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first survey to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => navigate('/surveys/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Survey
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSurveys.map((survey) => {
              const surveyResponses = responses.filter(r => r.surveyId === survey.id);
              const responseRate = survey.targetCount > 0
                ? Math.round((surveyResponses.length / survey.targetCount) * 100)
                : 0;
              const nps = calculateNPS(surveyResponses);

              return (
                <Card
                  key={survey.id}
                  className="enterprise-card-elevated cursor-pointer"
                  onClick={() => navigate(`/surveys/${survey.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">{survey.name}</h3>
                          {getStatusBadge(survey.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {survey.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {survey.targetCount} targets
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {surveyResponses.length} responses ({responseRate}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {survey.countries.length} countries, {survey.languages.length} languages
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {survey.status !== 'draft' && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{nps}</div>
                            <div className="text-xs text-muted-foreground">NPS</div>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/surveys/${survey.id}`); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {survey.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/surveys/${survey.id}/edit`); }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Survey
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePublish(survey.id); }}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Publish Survey
                                </DropdownMenuItem>
                              </>
                            )}
                            {survey.status === 'active' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClose(survey.id); }}>
                                <Archive className="h-4 w-4 mr-2" />
                                Close Survey
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDelete(survey.id); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Survey
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Survey</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this survey? This action cannot be undone.
                All associated targets and responses will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
