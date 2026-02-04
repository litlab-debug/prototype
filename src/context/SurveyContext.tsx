import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Survey,
  Target,
  Response,
  Question,
  User,
  SurveyStatus,
  Language,
  QuestionCategory,
  SurveyMetrics,
} from '@/types/survey';
import { generateMockData } from '@/lib/mockData';

interface SurveyContextType {
  // User
  currentUser: User;
  setCurrentUser: (user: User) => void;
  
  // Surveys
  surveys: Survey[];
  createSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>) => Survey;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  getSurvey: (id: string) => Survey | undefined;
  publishSurvey: (id: string) => void;
  closeSurvey: (id: string) => void;
  
  // Targets
  targets: Target[];
  addTargets: (surveyId: string, newTargets: Omit<Target, 'id' | 'surveyId' | 'status'>[]) => void;
  getTargetsForSurvey: (surveyId: string) => Target[];
  updateTargetStatus: (targetId: string, status: Target['status']) => void;
  sendReminders: (surveyId: string, targetIds: string[]) => void;
  
  // Responses
  responses: Response[];
  submitResponse: (response: Omit<Response, 'id' | 'submittedAt'>) => void;
  getResponsesForSurvey: (surveyId: string) => Response[];
  
  // Mandatory Questions
  mandatoryQuestions: Question[];
  updateMandatoryQuestion: (questionId: string, updates: Partial<Question>) => void;
  
  // Metrics
  getMetrics: () => SurveyMetrics;
  calculateNPS: (responses: Response[]) => number;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-1',
    email: 'admin@abbott.com',
    name: 'John Smith',
    role: 'super_admin',
  });
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [mandatoryQuestions, setMandatoryQuestions] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage or generate mock data
  useEffect(() => {
    const stored = localStorage.getItem('abbott-survey-data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSurveys(data.surveys || []);
        setTargets(data.targets || []);
        setResponses(data.responses || []);
        setMandatoryQuestions(data.mandatoryQuestions || generateDefaultMandatoryQuestions());
      } catch {
        const mockData = generateMockData();
        setSurveys(mockData.surveys);
        setTargets(mockData.targets);
        setResponses(mockData.responses);
        setMandatoryQuestions(generateDefaultMandatoryQuestions());
      }
    } else {
      const mockData = generateMockData();
      setSurveys(mockData.surveys);
      setTargets(mockData.targets);
      setResponses(mockData.responses);
      setMandatoryQuestions(generateDefaultMandatoryQuestions());
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('abbott-survey-data', JSON.stringify({
        surveys,
        targets,
        responses,
        mandatoryQuestions,
      }));
    }
  }, [surveys, targets, responses, mandatoryQuestions, isInitialized]);

  const createSurvey = (surveyData: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Survey => {
    const newSurvey: Survey = {
      ...surveyData,
      id: `survey-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSurveys(prev => [...prev, newSurvey]);
    return newSurvey;
  };

  const updateSurvey = (id: string, updates: Partial<Survey>) => {
    setSurveys(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ));
  };

  const deleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    setTargets(prev => prev.filter(t => t.surveyId !== id));
    setResponses(prev => prev.filter(r => r.surveyId !== id));
  };

  const getSurvey = (id: string) => surveys.find(s => s.id === id);

  const publishSurvey = (id: string) => {
    const survey = getSurvey(id);
    if (survey && survey.status === 'draft') {
      updateSurvey(id, { status: 'active' });
      // Simulate sending invitations
      const surveyTargets = getTargetsForSurvey(id);
      surveyTargets.forEach(target => {
        updateTargetStatus(target.id, 'invited');
      });
    }
  };

  const closeSurvey = (id: string) => {
    updateSurvey(id, { status: 'closed' });
  };

  const addTargets = (surveyId: string, newTargets: Omit<Target, 'id' | 'surveyId' | 'status'>[]) => {
    const targetsToAdd: Target[] = newTargets.map((t, index) => ({
      ...t,
      id: `target-${Date.now()}-${index}`,
      surveyId,
      status: 'pending' as const,
    }));
    setTargets(prev => [...prev, ...targetsToAdd]);
    
    // Update survey target count
    updateSurvey(surveyId, { 
      targetCount: (getSurvey(surveyId)?.targetCount || 0) + targetsToAdd.length 
    });
  };

  const getTargetsForSurvey = (surveyId: string) => 
    targets.filter(t => t.surveyId === surveyId);

  const updateTargetStatus = (targetId: string, status: Target['status']) => {
    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        const updates: Partial<Target> = { status };
        if (status === 'invited') updates.invitedAt = new Date().toISOString();
        if (status === 'reminded') updates.remindedAt = new Date().toISOString();
        if (status === 'completed') updates.completedAt = new Date().toISOString();
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const sendReminders = (surveyId: string, targetIds: string[]) => {
    targetIds.forEach(id => updateTargetStatus(id, 'reminded'));
  };

  const submitResponse = (responseData: Omit<Response, 'id' | 'submittedAt'>) => {
    const newResponse: Response = {
      ...responseData,
      id: `response-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setResponses(prev => [...prev, newResponse]);
    updateTargetStatus(responseData.targetId, 'completed');
    
    // Update survey response count
    const survey = getSurvey(responseData.surveyId);
    if (survey) {
      updateSurvey(responseData.surveyId, { 
        responseCount: (survey.responseCount || 0) + 1 
      });
    }
  };

  const getResponsesForSurvey = (surveyId: string) => 
    responses.filter(r => r.surveyId === surveyId);

  const updateMandatoryQuestion = (questionId: string, updates: Partial<Question>) => {
    setMandatoryQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const calculateNPS = (surveyResponses: Response[]): number => {
    const npsScores = surveyResponses
      .map(r => r.npsScore)
      .filter((score): score is number => score !== undefined);
    
    if (npsScores.length === 0) return 0;
    
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    
    return Math.round(((promoters - detractors) / npsScores.length) * 100);
  };

  const getMetrics = (): SurveyMetrics => {
    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => s.status === 'active').length;
    const totalResponses = responses.length;
    const averageNPS = calculateNPS(responses);
    
    const totalTargets = targets.length;
    const responseRate = totalTargets > 0 
      ? Math.round((totalResponses / totalTargets) * 100) 
      : 0;
    
    const avgTime = responses.length > 0
      ? Math.round(responses.reduce((sum, r) => sum + r.completionTime, 0) / responses.length)
      : 0;
    
    return {
      totalSurveys,
      activeSurveys,
      totalResponses,
      averageNPS,
      responseRate,
      averageCompletionTime: avgTime,
    };
  };

  return (
    <SurveyContext.Provider value={{
      currentUser,
      setCurrentUser,
      surveys,
      createSurvey,
      updateSurvey,
      deleteSurvey,
      getSurvey,
      publishSurvey,
      closeSurvey,
      targets,
      addTargets,
      getTargetsForSurvey,
      updateTargetStatus,
      sendReminders,
      responses,
      submitResponse,
      getResponsesForSurvey,
      mandatoryQuestions,
      updateMandatoryQuestion,
      getMetrics,
      calculateNPS,
    }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}

function generateDefaultMandatoryQuestions(): Question[] {
  const categories: QuestionCategory[] = [
    'overall_satisfaction',
    'product_quality',
    'customer_service',
    'delivery_experience',
    'value_for_money',
    'communication',
    'technical_support',
    'ease_of_use',
    'recommendation',
  ];

  return categories.map((category, index) => ({
    id: `mandatory-${category}`,
    category,
    type: category === 'recommendation' ? 'nps' : 'rating',
    text: {
      en: getDefaultQuestionText(category),
      es: getDefaultQuestionText(category),
      fr: getDefaultQuestionText(category),
      de: getDefaultQuestionText(category),
      it: getDefaultQuestionText(category),
      pt: getDefaultQuestionText(category),
      zh: getDefaultQuestionText(category),
      ja: getDefaultQuestionText(category),
    },
    required: true,
    isMandatory: true,
    order: index + 1,
    isActive: true,
  }));
}

function getDefaultQuestionText(category: QuestionCategory): string {
  const texts: Record<QuestionCategory, string> = {
    overall_satisfaction: 'How satisfied are you with your overall experience?',
    product_quality: 'How would you rate the quality of our products?',
    customer_service: 'How satisfied are you with our customer service?',
    delivery_experience: 'How would you rate your delivery experience?',
    value_for_money: 'How would you rate the value for money of our products?',
    communication: 'How satisfied are you with our communication?',
    technical_support: 'How would you rate our technical support?',
    ease_of_use: 'How easy is it to do business with us?',
    recommendation: 'How likely are you to recommend us to a colleague or friend?',
  };
  return texts[category];
}
