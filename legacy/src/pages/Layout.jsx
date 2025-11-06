

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { hasPermission } from "@/components/shared/PermissionsCheck";
import { LanguageProvider } from "@/components/shared/LanguageProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  Library,
  GraduationCap,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Home,
  ChevronDown,
  Building2,
  Search,
  Brain,
  Users // Added Users icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import GlobalSearch from "@/components/shared/GlobalSearch";
import NotificationCenter from "@/components/shared/NotificationCenter";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    {
      title: "Home",
      url: createPageUrl("Home"),
      icon: Home,
    },
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      protected: true,
    },
    {
      title: "Data Explorer",
      url: createPageUrl("DataExplorer"),
      icon: Database,
      permission: { category: 'data_access', action: 'view_all_cases' } // Added permission
    },
    {
      title: "Training Hub",
      url: createPageUrl("TrainingHub"),
      icon: GraduationCap,
    },
    {
      title: "Knowledge Library",
      url: createPageUrl("Library"),
      icon: Library,
    },
    {
      title: "AI Assistant",
      url: createPageUrl("AIAssistant"),
      icon: Sparkles,
      badge: "New",
    },
    {
      title: "Organization",
      url: createPageUrl("OrgDashboard"),
      icon: Building2,
      protected: true,
      adminOnly: true,
      permission: { category: 'organization', action: 'view_team' } // Added permission
    },
    {
      title: "Data Ingestion",
      url: createPageUrl("DataIngestion"),
      icon: Database,
      protected: true,
      adminOnly: true,
      badge: "Admin",
      permission: { category: 'sync_jobs', action: 'view_jobs' } // Added permission
    },
    {
      title: "AI Model Management",
      url: createPageUrl("AIModelManagement"),
      icon: Brain,
      protected: true,
      adminOnly: true,
      badge: "Admin",
      permission: { category: 'training_jobs', action: 'view_jobs' } // Added permission
    },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .teal-gradient {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
        }
        .gold-gradient {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
      `}</style>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 teal-gradient rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ABR Insight</h1>
                <p className="text-xs text-gray-500">Anti-Black Racism Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                if (item.protected && !user) return null;
                if (item.adminOnly && (!user || user.role !== 'admin')) return null;
                
                // Check permission if specified
                if (item.permission && user) {
                  if (!hasPermission(user, item.permission.category, item.permission.action)) {
                    return null;
                  }
                }
                
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <Link key={item.title} to={item.url}>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.title}
                      {item.badge && (
                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - NEW */}
              <LanguageSwitcher />

              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notification Center */}
              {user && <NotificationCenter user={user} />}

              {/* User Menu / Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 teal-gradient rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-900">
                        {user.full_name || user.email}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.role_name && (
                        <Badge className="mt-1 text-xs">{user.role_name}</Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <Link to={createPageUrl("Dashboard")}>
                      <DropdownMenuItem>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    {hasPermission(user, 'organization', 'view_team') && (
                      <Link to={createPageUrl("OrgDashboard")}>
                        <DropdownMenuItem>
                          <Building2 className="w-4 h-4 mr-2" />
                          Organization
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {hasPermission(user, 'sync_jobs', 'view_jobs') && (
                      <Link to={createPageUrl("DataIngestion")}>
                        <DropdownMenuItem>
                          <Database className="w-4 h-4 mr-2" />
                          Data Ingestion
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {hasPermission(user, 'training_jobs', 'view_jobs') && (
                      <Link to={createPageUrl("AIModelManagement")}>
                        <DropdownMenuItem>
                          <Brain className="w-4 h-4 mr-2" />
                          AI Model Management
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {hasPermission(user, 'organization', 'manage_users') && (
                      <>
                        <DropdownMenuSeparator />
                        <Link to={createPageUrl("UserManagement")}>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            User Management
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <Link to={createPageUrl("Profile")}>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="teal-gradient text-white"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSearchOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
                {navigationItems.map((item) => {
                  if (item.protected && !user) return null;
                  if (item.adminOnly && (!user || user.role !== 'admin')) return null;
                  
                  // Check permission if specified
                  if (item.permission && user) {
                    if (!hasPermission(user, item.permission.category, item.permission.action)) {
                      return null;
                    }
                  }
                  
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.title}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 teal-gradient rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">ABR Insight</h3>
                  <p className="text-xs text-gray-400">Canada's Leading Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Evidence-based training and data analysis for combating anti-Black racism in Canadian workplaces.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("DataExplorer")} className="hover:text-teal-400">Data Explorer</Link></li>
                <li><Link to={createPageUrl("TrainingHub")} className="hover:text-teal-400">Training Hub</Link></li>
                <li><Link to={createPageUrl("Library")} className="hover:text-teal-400">Knowledge Library</Link></li>
                <li><Link to={createPageUrl("AIAssistant")} className="hover:text-teal-400">AI Assistant</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400">Case Studies</a></li>
                <li><a href="#" className="hover:text-teal-400">Research Papers</a></li>
                <li><a href="#" className="hover:text-teal-400">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} ABR Insight Platform. All rights reserved.</p>
            <p className="mt-2">Empowering organizations to combat anti-Black racism through education and data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

