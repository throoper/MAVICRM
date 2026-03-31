import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type {
  Company,
  Contract,
  Talent,
  Issue,
  EmailTemplate,
  ScheduledEmail,
  JobOpening,
  ReplacementEvent,
  ClientInteraction,
  UtilizationRecord,
  TalentSurvey,
  PerformanceReview,
  Upsell,
} from "../types";
import { companyData } from "../data/companies";
import { contractData } from "../data/contracts";
import { talentData } from "../data/talent";
import { issueData } from "../data/issues";
import { emailTemplateData, scheduledEmailData } from "../data/emailTemplates";
import { jobOpeningData } from "../data/jobOpenings";
import { replacementData } from "../data/replacements";
import { interactionData } from "../data/interactions";
import { utilizationData } from "../data/utilization";
import { talentSurveyData } from "../data/talentSurveys";
import { performanceReviewData } from "../data/performanceReviews";
import { upsellData } from "../data/upsells";

interface AppState {
  companies: Company[];
  setCompanies: Dispatch<SetStateAction<Company[]>>;
  contracts: Contract[];
  setContracts: Dispatch<SetStateAction<Contract[]>>;
  talent: Talent[];
  setTalent: Dispatch<SetStateAction<Talent[]>>;
  issues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: Dispatch<SetStateAction<EmailTemplate[]>>;
  scheduledEmails: ScheduledEmail[];
  setScheduledEmails: Dispatch<SetStateAction<ScheduledEmail[]>>;
  jobOpenings: JobOpening[];
  setJobOpenings: Dispatch<SetStateAction<JobOpening[]>>;
  replacements: ReplacementEvent[];
  setReplacements: Dispatch<SetStateAction<ReplacementEvent[]>>;
  interactions: ClientInteraction[];
  setInteractions: Dispatch<SetStateAction<ClientInteraction[]>>;
  utilization: UtilizationRecord[];
  setUtilization: Dispatch<SetStateAction<UtilizationRecord[]>>;
  talentSurveys: TalentSurvey[];
  setTalentSurveys: Dispatch<SetStateAction<TalentSurvey[]>>;
  performanceReviews: PerformanceReview[];
  setPerformanceReviews: Dispatch<SetStateAction<PerformanceReview[]>>;
  upsells: Upsell[];
  setUpsells: Dispatch<SetStateAction<Upsell[]>>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(companyData);
  const [contracts, setContracts] = useState<Contract[]>(contractData);
  const [talent, setTalent] = useState<Talent[]>(talentData);
  const [issues, setIssues] = useState<Issue[]>(issueData);
  const [emailTemplates, setEmailTemplates] =
    useState<EmailTemplate[]>(emailTemplateData);
  const [scheduledEmails, setScheduledEmails] =
    useState<ScheduledEmail[]>(scheduledEmailData);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(jobOpeningData);
  const [replacements, setReplacements] = useState<ReplacementEvent[]>(replacementData);
  const [interactions, setInteractions] = useState<ClientInteraction[]>(interactionData);
  const [utilization, setUtilization] = useState<UtilizationRecord[]>(utilizationData);
  const [talentSurveys, setTalentSurveys] = useState<TalentSurvey[]>(talentSurveyData);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(performanceReviewData);
  const [upsells, setUpsells] = useState<Upsell[]>(upsellData);

  return (
    <AppContext.Provider
      value={{
        companies,
        setCompanies,
        contracts,
        setContracts,
        talent,
        setTalent,
        issues,
        setIssues,
        emailTemplates,
        setEmailTemplates,
        scheduledEmails,
        setScheduledEmails,
        jobOpenings,
        setJobOpenings,
        replacements,
        setReplacements,
        interactions,
        setInteractions,
        utilization,
        setUtilization,
        talentSurveys,
        setTalentSurveys,
        performanceReviews,
        setPerformanceReviews,
        upsells,
        setUpsells,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
