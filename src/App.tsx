import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SurveyProvider } from "@/context/SurveyContext";
import Dashboard from "./pages/Dashboard";
import SurveyManagement from "./pages/SurveyManagement";
import SurveyBuilder from "./pages/SurveyBuilder";
import SurveyDetail from "./pages/SurveyDetail";
import TargetManagement from "./pages/TargetManagement";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import QuestionBank from "./pages/QuestionBank";
import Settings from "./pages/Settings";
import RespondentSurvey from "./pages/RespondentSurvey";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SurveyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          basename={import.meta.env.DEV ? '/' : '/abbott-survey-suite/'}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/surveys" element={<SurveyManagement />} />
            <Route path="/surveys/create" element={<SurveyBuilder />} />
            <Route path="/surveys/:id" element={<SurveyDetail />} />
            <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
            <Route path="/targets" element={<TargetManagement />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/history" element={<History />} />
            <Route path="/questions" element={<QuestionBank />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/respond/:id" element={<RespondentSurvey />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SurveyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
