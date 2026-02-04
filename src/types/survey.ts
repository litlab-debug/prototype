// Survey Application Types

export type UserRole = 'super_admin' | 'admin' | 'read_only' | 'respondent';

export type SurveyStatus = 'draft' | 'active' | 'closed';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja';

export type Channel = 'email' | 'sms' | 'web' | 'phone';

export type QuestionType = 
  | 'nps' 
  | 'rating' 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'text' 
  | 'matrix'
  | 'yes_no';

export type QuestionCategory = 
  | 'overall_satisfaction'
  | 'product_quality'
  | 'customer_service'
  | 'delivery_experience'
  | 'value_for_money'
  | 'communication'
  | 'technical_support'
  | 'ease_of_use'
  | 'recommendation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  type: QuestionType;
  text: Record<Language, string>;
  description?: Record<Language, string>;
  required: boolean;
  isMandatory: boolean; // Global mandatory questions
  options?: Record<Language, string[]>;
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string | number;
  };
  order: number;
  isActive: boolean;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  status: SurveyStatus;
  languages: Language[];
  primaryLanguage: Language;
  countries: string[];
  channels: Channel[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  questions: Question[];
  messages: {
    invite: Record<Language, { subject: string; body: string }>;
    reminder: Record<Language, { subject: string; body: string }>;
    closing: Record<Language, { subject: string; body: string }>;
  };
  ccEmails: string[];
  targetCount: number;
  responseCount: number;
  reminderSchedule: {
    firstReminder: number; // Days before end
    secondReminder: number;
  };
}

export interface Target {
  id: string;
  surveyId: string;
  email: string;
  name: string;
  company?: string;
  country: string;
  language: Language;
  channel: Channel;
  segment?: string;
  status: 'pending' | 'invited' | 'reminded' | 'completed' | 'bounced';
  invitedAt?: string;
  remindedAt?: string;
  completedAt?: string;
}

export interface Response {
  id: string;
  surveyId: string;
  targetId: string;
  answers: Record<string, string | number | string[]>;
  npsScore?: number;
  submittedAt: string;
  language: Language;
  channel: Channel;
  country: string;
  completionTime: number; // seconds
}

export interface SurveyMetrics {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  averageNPS: number;
  responseRate: number;
  averageCompletionTime: number;
}

export interface CountryMetrics {
  country: string;
  targetCount: number;
  responseCount: number;
  responseRate: number;
  averageNPS: number;
}

export interface ChannelMetrics {
  channel: Channel;
  targetCount: number;
  responseCount: number;
  responseRate: number;
}

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
};

// Country list
export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Brazil',
  'Mexico',
  'Japan',
  'China',
  'India',
  'Australia',
  'Canada',
];

// Channel display names
export const CHANNEL_NAMES: Record<Channel, string> = {
  email: 'Email',
  sms: 'SMS',
  web: 'Web Link',
  phone: 'Phone',
};

// Question category labels
export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  overall_satisfaction: 'Overall Satisfaction',
  product_quality: 'Product Quality',
  customer_service: 'Customer Service',
  delivery_experience: 'Delivery Experience',
  value_for_money: 'Value for Money',
  communication: 'Communication',
  technical_support: 'Technical Support',
  ease_of_use: 'Ease of Use',
  recommendation: 'Recommendation (NPS)',
};
