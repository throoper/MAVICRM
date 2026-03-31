import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import CompanyList from "./components/companies/CompanyList";
import CompanyDetail from "./components/companies/CompanyDetail";
import TalentList from "./components/talent/TalentList";
import TalentDetail from "./components/talent/TalentDetail";
import IssueList from "./components/issues/IssueList";
import IssueDetail from "./components/issues/IssueDetail";
import IssueForm from "./components/issues/IssueForm";
import ReportsHub from "./components/reports/ReportsHub";
import EmailCheckInsPage from "./components/emails/EmailCheckInsPage";
import TemplateEditor from "./components/emails/TemplateEditor";
import UpsellsPage from "./components/upsells/UpsellsPage";
import UpsellDetail from "./components/upsells/UpsellDetail";
import ContractsPage from "./components/contracts/ContractsPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <div className="app-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/talent" element={<TalentList />} />
              <Route path="/talent/:id" element={<TalentDetail />} />
              <Route path="/issues" element={<IssueList />} />
              <Route path="/issues/new" element={<IssueForm />} />
              <Route path="/issues/:id" element={<IssueDetail />} />
              <Route path="/reports" element={<ReportsHub />} />
              <Route path="/email-check-ins" element={<EmailCheckInsPage />} />
              <Route path="/email-check-ins/:id" element={<TemplateEditor />} />
              <Route path="/upsells" element={<UpsellsPage />} />
              <Route path="/upsells/:id" element={<UpsellDetail />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
