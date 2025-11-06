import Layout from "./Layout.jsx";

import Home from "./Home";

import DataExplorer from "./DataExplorer";

import TrainingHub from "./TrainingHub";

import Library from "./Library";

import Dashboard from "./Dashboard";

import CoursePlayer from "./CoursePlayer";

import Profile from "./Profile";

import AIAssistant from "./AIAssistant";

import CaseDetails from "./CaseDetails";

import OrgDashboard from "./OrgDashboard";

import TeamManagement from "./TeamManagement";

import Analytics from "./Analytics";

import OrgSettings from "./OrgSettings";

import Resources from "./Resources";

import Achievements from "./Achievements";

import Leaderboard from "./Leaderboard";

import AICoach from "./AICoach";

import DataIngestion from "./DataIngestion";

import AIModelManagement from "./AIModelManagement";

import UserManagement from "./UserManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    DataExplorer: DataExplorer,
    
    TrainingHub: TrainingHub,
    
    Library: Library,
    
    Dashboard: Dashboard,
    
    CoursePlayer: CoursePlayer,
    
    Profile: Profile,
    
    AIAssistant: AIAssistant,
    
    CaseDetails: CaseDetails,
    
    OrgDashboard: OrgDashboard,
    
    TeamManagement: TeamManagement,
    
    Analytics: Analytics,
    
    OrgSettings: OrgSettings,
    
    Resources: Resources,
    
    Achievements: Achievements,
    
    Leaderboard: Leaderboard,
    
    AICoach: AICoach,
    
    DataIngestion: DataIngestion,
    
    AIModelManagement: AIModelManagement,
    
    UserManagement: UserManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/DataExplorer" element={<DataExplorer />} />
                
                <Route path="/TrainingHub" element={<TrainingHub />} />
                
                <Route path="/Library" element={<Library />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CoursePlayer" element={<CoursePlayer />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/CaseDetails" element={<CaseDetails />} />
                
                <Route path="/OrgDashboard" element={<OrgDashboard />} />
                
                <Route path="/TeamManagement" element={<TeamManagement />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/OrgSettings" element={<OrgSettings />} />
                
                <Route path="/Resources" element={<Resources />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/AICoach" element={<AICoach />} />
                
                <Route path="/DataIngestion" element={<DataIngestion />} />
                
                <Route path="/AIModelManagement" element={<AIModelManagement />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}