import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSurvey } from '@/context/SurveyContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Survey,
  Language,
  Channel,
  LANGUAGE_NAMES,
  COUNTRIES,
  CHANNEL_NAMES,
  Question,
} from '@/types/survey';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  Globe,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const languages: Language[] = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'];
const channels: Channel[] = ['email', 'sms', 'web', 'phone'];

const defaultSurvey: Partial<Survey> = {
  name: '',
  description: '',
  status: 'draft',
  languages: ['en'],
  primaryLanguage: 'en',
  countries: [],
  channels: ['email'],
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  questions: [],
  messages: {
    invite: {
      en: { subject: 'We value your feedback', body: 'Dear Customer, we would appreciate your feedback.' },
      es: { subject: '', body: '' }, fr: { subject: '', body: '' }, de: { subject: '', body: '' },
      it: { subject: '', body: '' }, pt: { subject: '', body: '' }, zh: { subject: '', body: '' }, ja: { subject: '', body: '' },
    },
    reminder: {
      en: { subject: 'Reminder: We value your feedback', body: 'This is a friendly reminder to complete our survey.' },
      es: { subject: '', body: '' }, fr: { subject: '', body: '' }, de: { subject: '', body: '' },
      it: { subject: '', body: '' }, pt: { subject: '', body: '' }, zh: { subject: '', body: '' }, ja: { subject: '', body: '' },
    },
    closing: {
      en: { subject: 'Thank you for your feedback', body: 'Thank you for completing our survey.' },
      es: { subject: '', body: '' }, fr: { subject: '', body: '' }, de: { subject: '', body: '' },
      it: { subject: '', body: '' }, pt: { subject: '', body: '' }, zh: { subject: '', body: '' }, ja: { subject: '', body: '' },
    },
  },
  ccEmails: [],
  targetCount: 0,
  responseCount: 0,
  reminderSchedule: { firstReminder: 7, secondReminder: 3 },
};

export default function SurveyBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSurvey, createSurvey, updateSurvey, mandatoryQuestions, publishSurvey } = useSurvey();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<Survey>>(defaultSurvey);
  const [selectedMessageLang, setSelectedMessageLang] = useState<Language>('en');
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      const survey = getSurvey(id);
      if (survey) {
        setFormData(survey);
      }
    } else {
      // Add mandatory questions to new survey
      setFormData(prev => ({
        ...prev,
        questions: mandatoryQuestions.filter(q => q.isActive),
      }));
    }
  }, [id, getSurvey, mandatoryQuestions]);

  const updateFormData = <K extends keyof Survey>(key: K, value: Survey[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleLanguage = (lang: Language) => {
    const current = formData.languages || [];
    if (current.includes(lang)) {
      if (current.length > 1) {
        updateFormData('languages', current.filter(l => l !== lang));
        if (formData.primaryLanguage === lang) {
          updateFormData('primaryLanguage', current.filter(l => l !== lang)[0]);
        }
      }
    } else {
      updateFormData('languages', [...current, lang]);
    }
  };

  const toggleCountry = (country: string) => {
    const current = formData.countries || [];
    if (current.includes(country)) {
      updateFormData('countries', current.filter(c => c !== country));
    } else {
      updateFormData('countries', [...current, country]);
    }
  };

  const toggleChannel = (channel: Channel) => {
    const current = formData.channels || [];
    if (current.includes(channel)) {
      if (current.length > 1) {
        updateFormData('channels', current.filter(c => c !== channel));
      }
    } else {
      updateFormData('channels', [...current, channel]);
    }
  };

  const updateMessage = (type: 'invite' | 'reminder' | 'closing', field: 'subject' | 'body', value: string) => {
    setFormData(prev => ({
      ...prev,
      messages: {
        ...prev.messages!,
        [type]: {
          ...prev.messages![type],
          [selectedMessageLang]: {
            ...prev.messages![type][selectedMessageLang],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Survey name is required', variant: 'destructive' });
      return;
    }

    if (isEditing && id) {
      updateSurvey(id, formData as Partial<Survey>);
      toast({ title: 'Success', description: 'Survey updated successfully' });
    } else {
      const newSurvey = createSurvey({
        ...formData,
        createdBy: 'user-1',
      } as Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>);
      toast({ title: 'Success', description: 'Survey created successfully' });
      navigate(`/surveys/${newSurvey.id}`);
    }
  };

  const handlePublish = () => {
    if (!formData.name || !formData.countries?.length) {
      toast({ title: 'Error', description: 'Please complete all required fields', variant: 'destructive' });
      return;
    }

    if (isEditing && id) {
      handleSave();
      publishSurvey(id);
      toast({ title: 'Success', description: 'Survey published successfully' });
      navigate(`/surveys/${id}`);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Calendar },
    { id: 'scope', label: 'Scope', icon: Globe },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'messages', label: 'Messages', icon: Mail },
  ];

  return (
    <AppLayout 
      title={isEditing ? 'Edit Survey' : 'Create Survey'} 
      description="Configure your customer satisfaction survey"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/surveys')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            {formData.status === 'draft' && (
              <Button onClick={handlePublish}>
                <Send className="h-4 w-4 mr-2" />
                Publish Survey
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Survey Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Q4 2025 Customer Satisfaction Survey"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this survey..."
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => updateFormData('startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => updateFormData('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Reminder (days before end)</Label>
                      <Input
                        type="number"
                        value={formData.reminderSchedule?.firstReminder || 7}
                        onChange={(e) => updateFormData('reminderSchedule', {
                          ...formData.reminderSchedule!,
                          firstReminder: parseInt(e.target.value),
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Second Reminder (days before end)</Label>
                      <Input
                        type="number"
                        value={formData.reminderSchedule?.secondReminder || 3}
                        onChange={(e) => updateFormData('reminderSchedule', {
                          ...formData.reminderSchedule!,
                          secondReminder: parseInt(e.target.value),
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scope Tab */}
          <TabsContent value="scope">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Language</Label>
                    <Select
                      value={formData.primaryLanguage}
                      onValueChange={(v) => updateFormData('primaryLanguage', v as Language)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.languages?.map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {LANGUAGE_NAMES[lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Available Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(lang => (
                        <Badge
                          key={lang}
                          variant={formData.languages?.includes(lang) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleLanguage(lang)}
                        >
                          {LANGUAGE_NAMES[lang]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {channels.map(channel => (
                      <Badge
                        key={channel}
                        variant={formData.channels?.includes(channel) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleChannel(channel)}
                      >
                        {CHANNEL_NAMES[channel]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map(country => (
                      <Badge
                        key={country}
                        variant={formData.countries?.includes(country) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCountry(country)}
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                  {formData.countries?.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Select at least one country
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Survey Questions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mandatory questions are automatically included and cannot be removed
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.questions?.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-4 border border-border rounded-lg"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {question.type.replace('_', ' ')}
                          </Badge>
                          {question.isMandatory && (
                            <Badge className="bg-primary/10 text-primary text-xs">Mandatory</Badge>
                          )}
                          {question.required && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm">{question.text.en}</p>
                      </div>
                      {!question.isMandatory && (
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Templates</CardTitle>
                  <Select
                    value={selectedMessageLang}
                    onValueChange={(v) => setSelectedMessageLang(v as Language)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.languages?.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {LANGUAGE_NAMES[lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Invitation */}
                <div className="space-y-4">
                  <h4 className="font-medium">Invitation Email</h4>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={formData.messages?.invite[selectedMessageLang]?.subject || ''}
                      onChange={(e) => updateMessage('invite', 'subject', e.target.value)}
                      placeholder="Email subject line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={formData.messages?.invite[selectedMessageLang]?.body || ''}
                      onChange={(e) => updateMessage('invite', 'body', e.target.value)}
                      placeholder="Email body content..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Reminder */}
                <div className="space-y-4">
                  <h4 className="font-medium">Reminder Email</h4>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={formData.messages?.reminder[selectedMessageLang]?.subject || ''}
                      onChange={(e) => updateMessage('reminder', 'subject', e.target.value)}
                      placeholder="Email subject line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={formData.messages?.reminder[selectedMessageLang]?.body || ''}
                      onChange={(e) => updateMessage('reminder', 'body', e.target.value)}
                      placeholder="Email body content..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Closing */}
                <div className="space-y-4">
                  <h4 className="font-medium">Thank You Email</h4>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={formData.messages?.closing[selectedMessageLang]?.subject || ''}
                      onChange={(e) => updateMessage('closing', 'subject', e.target.value)}
                      placeholder="Email subject line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={formData.messages?.closing[selectedMessageLang]?.body || ''}
                      onChange={(e) => updateMessage('closing', 'body', e.target.value)}
                      placeholder="Email body content..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* CC Emails */}
                <div className="space-y-4">
                  <h4 className="font-medium">CC Recipients</h4>
                  <Input
                    placeholder="Enter email addresses separated by commas"
                    value={formData.ccEmails?.join(', ') || ''}
                    onChange={(e) => updateFormData('ccEmails', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const idx = tabs.findIndex(t => t.id === activeTab);
              if (idx > 0) setActiveTab(tabs[idx - 1].id);
            }}
            disabled={activeTab === tabs[0].id}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={() => {
              const idx = tabs.findIndex(t => t.id === activeTab);
              if (idx < tabs.length - 1) {
                setActiveTab(tabs[idx + 1].id);
              } else {
                handleSave();
              }
            }}
          >
            {activeTab === tabs[tabs.length - 1].id ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Survey
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
