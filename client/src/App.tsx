import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import JobDetail from "./pages/JobDetail";
import MyResumes from "./pages/MyResumes";
import MyApplications from "./pages/MyApplications";
import Documents from "./pages/Documents";
import MatchedJobs from "./pages/MatchedJobs";
import Documentation from "./pages/Documentation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/jobs/:id"} component={JobDetail} />
      <Route path={"/my-resumes"} component={MyResumes} />
      <Route path={"/my-applications"} component={MyApplications} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/matched-jobs"} component={MatchedJobs} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
