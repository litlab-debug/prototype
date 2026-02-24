import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '@/context/SurveyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Language, LANGUAGE_NAMES } from '@/types/survey';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RespondentSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSurvey, submitResponse } = useSurvey();
  
  const survey = getSurvey(id!);
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [respondentInfo, setRespondentInfo] = useState({ name: '', email: '', company: '' });
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  if (!survey || survey.status !== 'active') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Survey Not Available</h2>
            <p className="text-muted-foreground">This survey is no longer active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = survey.questions.filter(q => q.isActive);
  const totalSteps = questions.length + 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleSubmit = () => {
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    const npsQuestion = questions.find(q => q.type === 'nps');
    const npsScore = npsQuestion ? answers[npsQuestion.id] as number : undefined;

    submitResponse({
      surveyId: survey.id,
      targetId: `respondent-${Date.now()}`,
      answers,
      npsScore,
      language,
      channel: 'web',
      country: 'United States',
      completionTime,
    });

    setSubmitted(true);
    toast({ title: 'Thank you!', description: 'Your response has been submitted.' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your feedback has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CS</span>
            </div>
            <span className="font-semibold">Customer Survey</span>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Progress value={progress} className="mb-8" />

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{survey.description}</p>
              <div className="space-y-2">
                <Label>Select your language</Label>
                <RadioGroup value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  {survey.languages.map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <RadioGroupItem value={lang} id={lang} />
                      <Label htmlFor={lang}>{LANGUAGE_NAMES[lang]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name *</Label>
                  <Input value={respondentInfo.name} onChange={(e) => setRespondentInfo(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Your Email *</Label>
                  <Input type="email" value={respondentInfo.email} onChange={(e) => setRespondentInfo(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={respondentInfo.company} onChange={(e) => setRespondentInfo(p => ({ ...p, company: e.target.value }))} />
                </div>
              </div>
              <Button onClick={() => setStep(1)} disabled={!respondentInfo.name || !respondentInfo.email} className="w-full">
                Start Survey
              </Button>
            </CardContent>
          </Card>
        )}

        {step > 0 && step <= questions.length && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question {step} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const question = questions[step - 1];
                return (
                  <>
                    <p className="font-medium">{question.text[language] || question.text.en}</p>
                    
                    {question.type === 'nps' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Not at all likely</span>
                          <span>Extremely likely</span>
                        </div>
                        <div className="grid grid-cols-11 gap-1">
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                            <Button key={n} variant={answers[question.id] === n ? 'default' : 'outline'} size="sm"
                              onClick={() => setAnswers(p => ({ ...p, [question.id]: n }))}>
                              {n}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'rating' && (
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(n => (
                          <Button key={n} variant={answers[question.id] === n ? 'default' : 'outline'} size="lg"
                            onClick={() => setAnswers(p => ({ ...p, [question.id]: n }))}>
                            {n}
                          </Button>
                        ))}
                      </div>
                    )}

                    {question.type === 'text' && (
                      <Textarea placeholder="Your feedback..." value={answers[question.id] as string || ''}
                        onChange={(e) => setAnswers(p => ({ ...p, [question.id]: e.target.value }))} rows={4} />
                    )}
                  </>
                );
              })()}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
                <Button onClick={() => setStep(s => s + 1)}>
                  {step === questions.length ? 'Review' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step > questions.length && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Thank you for completing the survey. Click submit to send your feedback.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(questions.length)}>Back</Button>
                <Button onClick={handleSubmit} className="flex-1">Submit Response</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
