import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSurvey } from '@/context/SurveyContext';
import { CATEGORY_LABELS } from '@/types/survey';

export default function QuestionBank() {
  const { mandatoryQuestions, updateMandatoryQuestion } = useSurvey();

  return (
    <AppLayout title="Question Bank" description="Manage global mandatory questions">
      <div className="space-y-6 animate-fade-in">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle>Mandatory Question Categories</CardTitle>
            <p className="text-sm text-muted-foreground">
              These 9 categories are required in all surveys. Toggle to enable/disable.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mandatoryQuestions.map(question => (
                <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{CATEGORY_LABELS[question.category]}</span>
                      <Badge variant="outline" className="text-xs">{question.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{question.text.en}</p>
                  </div>
                  <Switch
                    checked={question.isActive}
                    onCheckedChange={(checked) => updateMandatoryQuestion(question.id, { isActive: checked })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
