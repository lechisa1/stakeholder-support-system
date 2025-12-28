// src/App.tsx
import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import Organization from "./pages/organization/organization";
import Inistitutes from "./InternalPages/Organization/organization";
import Login from "./components/auth/Login";
import Project from "./pages/project/project";
import Permission from "./pages/permission/permission";
import ProjectLevel from "./pages/priorityLevel/priorityLevel";
import IssueCategory from "./pages/issueCategory/issueCategory";
import MyIssue from "./pages/issue/my_issue";
import IssueFlowConfig from "./pages/IssueFlowConfiguration/IssueFlowConfiguration";
import Roles from "./pages/role/role";
// import Users from "./pages/Tables/Users";
import BaseData from "./pages/Basedata/Basedata";
import Metrics from "./pages/metrics/Metrics";
import OrgStructure from "./pages/org_structure/org_structure";
import ProtectedRoute from "./ProtectedRoute";
import MyissueForm from "./pages/issue/my_issue_form";
// import TeamLeaderTask from "./pages/TeamLeaderTaskList/TeamLeaderTaskList";
// import TeamLeaderTaskDetail from "./pages/TeamLeaderTaskList/TeamLeaderTaskDetail";

// internal
import InternalTaskList from "./InternalPages/Tasks/TaskList";
import InternalTaskDetail from "./InternalPages/Tasks/TaskDetail";

import UserTaskList from "./pages/userTasks/TaskList";
import UserTaskDetail from "./pages/userTasks/TaskDetail";
import IssueDetail from "./pages/issue/issueDetail";
import "./localization";
import Users from "./pages/Users/users";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ProjectDetail from "./pages/project/ProjectDetail";
import InternalProjectDetail from "./InternalPages/Project/ProjectDetail";
import { Toaster } from "sonner";
import UserDetail from "./pages/Users/userDetail";
import OrganizationDetail from "./pages/organization/organizationDetail";
import InistituteDetail from "./InternalPages/Organization/organizationDetail";
import OrgStructureDetail from "./pages/org_structure/org_structureDetail";
import IssueCategoryDetail from "./pages/issueCategory/issueCategoryDetail";
import CreateRole from "./pages/role/createRole";
import Profile from "./pages/profile/profile";
import PriorityLevelDetail from "./pages/priorityLevel/priorityLevelDetail";
import InternalAppLayout from "./layout/InternalLayout/InternalAppLayout";
import IssueFlow from "./InternalPages/IssueFlow/IssueFlow";
import IssueConfigurationDetail from "./InternalPages/IssueFlow/IssueConfigurationDetail";
import LandingPage from "./pages/home/LandingPage";
import TrackPage from "./pages/home/TrackPage";
import TrackPageDetail from "./pages/home/TrackPageDetail";
import OrganizationProfile from "./pages/profile/OrganizationProfile";
import ExternalLogin from "./components/auth/ExternalLogin";
const AuthLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoader />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }
  return (
    <Router>
      <BreadcrumbProvider>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/track_request" element={<TrackPage />} />
          <Route path="/track_request/:id" element={<TrackPageDetail />} />
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermissions={['user_read']}>
                <Users />
              </ProtectedRoute>
            }
          // /> */}
            {/* InternalTaskList */}

            <Route path="/task_list" element={<InternalTaskList />} />
            <Route path="/task_list/:id" element={<InternalTaskDetail />} />

            <Route path="/task" element={<UserTaskList />} />
            <Route path="/task/:id" element={<UserTaskDetail />} />
            <Route path="/issue/:id" element={<IssueDetail />} />

            <Route path="/profile" element={<Profile />} />
            <Route
              path="/organization_profile"
              element={<OrganizationProfile />}
            />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/inistitutes" element={<Inistitutes />} />
            <Route path="/organization/:id" element={<OrganizationDetail />} />
            <Route path="/inistitutes/:id" element={<InistituteDetail />} />

            <Route path="/project" element={<Project />} />
            <Route path="/project/:id" element={<ProjectDetail />} />

            <Route
              path="/inistitutes/:instituteId/projects/:id"
              element={<InternalProjectDetail />}
            />
            <Route path="/issue_flow/:id" element={<IssueFlow />} />
            <Route path="/priority_level" element={<ProjectLevel />} />
            <Route
              path="/priority_level/:id"
              element={<PriorityLevelDetail />}
            />
            <Route path="/permission" element={<Permission />} />
            <Route path="/role" element={<Roles />} />
            <Route path="/role/:id" element={<CreateRole />} />
            <Route path="/role/create" element={<CreateRole />} />
            <Route path="/issue_category" element={<IssueCategory />} />
            <Route
              path="/issue_category/:id"
              element={<IssueCategoryDetail />}
            />
            <Route path="/my_requests" element={<MyIssue />} />
            <Route path="/issue_configuration" element={<IssueFlowConfig />} />
            <Route
              path="/issue_configuration/:id"
              element={<IssueConfigurationDetail />}
            />
            <Route path="/issue_flow/:id" element={<IssueFlow />} />
            {/* IssueFlowConfig */}
            <Route path="/add_issue" element={<MyissueForm />} />

            <Route path="/org_structure" element={<OrgStructure />} />
            <Route path="/org_structure/:id" element={<OrgStructureDetail />} />
            {/* Metrics */}
            <Route path="/human_resource" element={<Metrics />} />
            <Route path="/basedata" element={<BaseData />} />

            <Route
              path="/roles"
              element={
                //<ProtectedRoute requiredPermissions={['role_read']}>
                <Roles />
                //</ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <ExternalLogin />
              </PublicRoute>
            }
          />
          {/* Internal Routes */}
          <Route element={<InternalAppLayout />}>
            <Route path="/internal/dashboard" element={<Home />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BreadcrumbProvider>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Provider>
  );
}
