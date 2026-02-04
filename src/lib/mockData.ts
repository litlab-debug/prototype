import { Survey, Target, Response, Language, Channel } from '@/types/survey';

export function generateMockData(): {
  surveys: Survey[];
  targets: Target[];
  responses: Response[];
} {
  const surveys: Survey[] = [
    {
      id: 'survey-1',
      name: 'Q4 2025 Customer Satisfaction Survey',
      description: 'Quarterly customer satisfaction measurement for all regions',
      status: 'active',
      languages: ['en', 'es', 'fr', 'de'],
      primaryLanguage: 'en',
      countries: ['United States', 'Germany', 'France', 'Spain'],
      channels: ['email', 'web'],
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      createdAt: '2025-09-15T10:00:00Z',
      updatedAt: '2025-10-01T08:00:00Z',
      createdBy: 'user-1',
      questions: generateDefaultQuestions(),
      messages: generateDefaultMessages(),
      ccEmails: ['survey-admin@abbott.com'],
      targetCount: 1250,
      responseCount: 847,
      reminderSchedule: { firstReminder: 7, secondReminder: 3 },
    },
    {
      id: 'survey-2',
      name: 'Product Launch Feedback - Libre 4',
      description: 'Post-launch feedback collection for Libre 4 glucose monitor',
      status: 'active',
      languages: ['en', 'de', 'fr'],
      primaryLanguage: 'en',
      countries: ['United States', 'Germany', 'United Kingdom'],
      channels: ['email'],
      startDate: '2025-11-01',
      endDate: '2026-01-31',
      createdAt: '2025-10-20T14:00:00Z',
      updatedAt: '2025-11-01T09:00:00Z',
      createdBy: 'user-1',
      questions: generateDefaultQuestions(),
      messages: generateDefaultMessages(),
      ccEmails: ['product-team@abbott.com'],
      targetCount: 500,
      responseCount: 312,
      reminderSchedule: { firstReminder: 5, secondReminder: 2 },
    },
    {
      id: 'survey-3',
      name: 'Annual Partner Satisfaction Survey 2025',
      description: 'Annual satisfaction survey for distribution partners',
      status: 'closed',
      languages: ['en', 'es', 'pt'],
      primaryLanguage: 'en',
      countries: ['United States', 'Brazil', 'Mexico'],
      channels: ['email', 'phone'],
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      createdAt: '2025-05-15T10:00:00Z',
      updatedAt: '2025-09-01T10:00:00Z',
      createdBy: 'user-1',
      questions: generateDefaultQuestions(),
      messages: generateDefaultMessages(),
      ccEmails: ['partner-relations@abbott.com'],
      targetCount: 350,
      responseCount: 298,
      reminderSchedule: { firstReminder: 7, secondReminder: 3 },
    },
    {
      id: 'survey-4',
      name: 'Healthcare Provider Experience Survey',
      description: 'Understanding HCP experience with Abbott diagnostics',
      status: 'draft',
      languages: ['en'],
      primaryLanguage: 'en',
      countries: ['United States'],
      channels: ['email'],
      startDate: '2026-02-01',
      endDate: '2026-04-30',
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
      createdBy: 'user-1',
      questions: generateDefaultQuestions(),
      messages: generateDefaultMessages(),
      ccEmails: [],
      targetCount: 0,
      responseCount: 0,
      reminderSchedule: { firstReminder: 7, secondReminder: 3 },
    },
  ];

  const targets: Target[] = [];
  const responses: Response[] = [];

  // Generate targets and responses for active/closed surveys
  surveys.filter(s => s.status !== 'draft').forEach(survey => {
    const targetData = generateTargetsForSurvey(survey);
    targets.push(...targetData.targets);
    responses.push(...targetData.responses);
  });

  return { surveys, targets, responses };
}

function generateDefaultQuestions() {
  return [
    {
      id: 'q-overall',
      category: 'overall_satisfaction' as const,
      type: 'rating' as const,
      text: { en: 'How satisfied are you with your overall experience?', es: '¿Qué tan satisfecho está con su experiencia general?', fr: 'Êtes-vous satisfait de votre expérience globale?', de: 'Wie zufrieden sind Sie mit Ihrer Gesamterfahrung?', it: '', pt: '', zh: '', ja: '' },
      required: true,
      isMandatory: true,
      order: 1,
      isActive: true,
    },
    {
      id: 'q-product',
      category: 'product_quality' as const,
      type: 'rating' as const,
      text: { en: 'How would you rate the quality of our products?', es: '¿Cómo calificaría la calidad de nuestros productos?', fr: 'Comment évalueriez-vous la qualité de nos produits?', de: 'Wie bewerten Sie die Qualität unserer Produkte?', it: '', pt: '', zh: '', ja: '' },
      required: true,
      isMandatory: true,
      order: 2,
      isActive: true,
    },
    {
      id: 'q-service',
      category: 'customer_service' as const,
      type: 'rating' as const,
      text: { en: 'How satisfied are you with our customer service?', es: '¿Qué tan satisfecho está con nuestro servicio al cliente?', fr: 'Êtes-vous satisfait de notre service client?', de: 'Wie zufrieden sind Sie mit unserem Kundenservice?', it: '', pt: '', zh: '', ja: '' },
      required: true,
      isMandatory: true,
      order: 3,
      isActive: true,
    },
    {
      id: 'q-nps',
      category: 'recommendation' as const,
      type: 'nps' as const,
      text: { en: 'How likely are you to recommend us to a colleague or friend?', es: '¿Qué tan probable es que nos recomiende a un colega o amigo?', fr: 'Recommanderiez-vous nos services à un collègue ou un ami?', de: 'Wie wahrscheinlich ist es, dass Sie uns einem Kollegen oder Freund empfehlen?', it: '', pt: '', zh: '', ja: '' },
      required: true,
      isMandatory: true,
      order: 4,
      isActive: true,
    },
    {
      id: 'q-feedback',
      category: 'overall_satisfaction' as const,
      type: 'text' as const,
      text: { en: 'Do you have any additional feedback for us?', es: '¿Tiene algún comentario adicional para nosotros?', fr: 'Avez-vous des commentaires supplémentaires?', de: 'Haben Sie zusätzliches Feedback für uns?', it: '', pt: '', zh: '', ja: '' },
      required: false,
      isMandatory: false,
      order: 5,
      isActive: true,
    },
  ];
}

function generateDefaultMessages() {
  return {
    invite: {
      en: { subject: 'We value your feedback', body: 'Dear Customer, we would appreciate your feedback on your recent experience with Abbott.' },
      es: { subject: 'Valoramos sus comentarios', body: 'Estimado cliente, agradeceríamos sus comentarios sobre su reciente experiencia con Abbott.' },
      fr: { subject: 'Votre avis compte', body: 'Cher client, nous apprécierions vos commentaires sur votre récente expérience avec Abbott.' },
      de: { subject: 'Wir schätzen Ihr Feedback', body: 'Sehr geehrter Kunde, wir würden uns über Ihr Feedback zu Ihrer letzten Erfahrung mit Abbott freuen.' },
      it: { subject: '', body: '' },
      pt: { subject: '', body: '' },
      zh: { subject: '', body: '' },
      ja: { subject: '', body: '' },
    },
    reminder: {
      en: { subject: 'Reminder: We value your feedback', body: 'This is a friendly reminder to complete our customer satisfaction survey.' },
      es: { subject: 'Recordatorio: Valoramos sus comentarios', body: 'Este es un recordatorio amistoso para completar nuestra encuesta.' },
      fr: { subject: 'Rappel: Votre avis compte', body: 'Ceci est un rappel amical pour compléter notre enquête.' },
      de: { subject: 'Erinnerung: Wir schätzen Ihr Feedback', body: 'Dies ist eine freundliche Erinnerung, unsere Umfrage auszufüllen.' },
      it: { subject: '', body: '' },
      pt: { subject: '', body: '' },
      zh: { subject: '', body: '' },
      ja: { subject: '', body: '' },
    },
    closing: {
      en: { subject: 'Thank you for your feedback', body: 'Thank you for taking the time to complete our survey. Your feedback helps us improve.' },
      es: { subject: 'Gracias por sus comentarios', body: 'Gracias por tomarse el tiempo para completar nuestra encuesta.' },
      fr: { subject: 'Merci pour vos commentaires', body: 'Merci d\'avoir pris le temps de compléter notre enquête.' },
      de: { subject: 'Vielen Dank für Ihr Feedback', body: 'Vielen Dank, dass Sie sich die Zeit genommen haben, unsere Umfrage auszufüllen.' },
      it: { subject: '', body: '' },
      pt: { subject: '', body: '' },
      zh: { subject: '', body: '' },
      ja: { subject: '', body: '' },
    },
  };
}

function generateTargetsForSurvey(survey: Survey): { targets: Target[]; responses: Response[] } {
  const targets: Target[] = [];
  const responses: Response[] = [];
  
  const names = [
    'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
    'Jennifer Taylor', 'Robert Anderson', 'Lisa Thomas', 'William Jackson', 'Mary White',
    'James Harris', 'Patricia Martin', 'Charles Garcia', 'Elizabeth Martinez', 'Joseph Robinson',
  ];
  
  const companies = [
    'City Hospital', 'Regional Medical Center', 'University Health', 'Community Care',
    'Premier Healthcare', 'Valley Clinic', 'Metro Health Systems', 'Sunrise Medical',
  ];

  for (let i = 0; i < survey.targetCount; i++) {
    const country = survey.countries[i % survey.countries.length];
    const language = survey.languages[i % survey.languages.length] as Language;
    const channel = survey.channels[i % survey.channels.length] as Channel;
    const hasResponded = i < survey.responseCount;
    
    const target: Target = {
      id: `target-${survey.id}-${i}`,
      surveyId: survey.id,
      email: `contact${i}@${companies[i % companies.length].toLowerCase().replace(/\s/g, '')}.com`,
      name: names[i % names.length],
      company: companies[i % companies.length],
      country,
      language,
      channel,
      segment: i % 3 === 0 ? 'Enterprise' : i % 3 === 1 ? 'Mid-Market' : 'SMB',
      status: hasResponded ? 'completed' : (survey.status === 'closed' ? 'reminded' : 'invited'),
      invitedAt: survey.startDate,
      completedAt: hasResponded ? new Date(Date.parse(survey.startDate) + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
    targets.push(target);

    if (hasResponded) {
      const npsScore = Math.floor(Math.random() * 11);
      const response: Response = {
        id: `response-${survey.id}-${i}`,
        surveyId: survey.id,
        targetId: target.id,
        answers: {
          'q-overall': Math.floor(Math.random() * 5) + 1,
          'q-product': Math.floor(Math.random() * 5) + 1,
          'q-service': Math.floor(Math.random() * 5) + 1,
          'q-nps': npsScore,
        },
        npsScore,
        submittedAt: target.completedAt!,
        language,
        channel,
        country,
        completionTime: Math.floor(Math.random() * 300) + 120,
      };
      responses.push(response);
    }
  }

  return { targets, responses };
}
