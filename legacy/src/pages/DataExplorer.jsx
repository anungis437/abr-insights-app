
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Calendar,
  Scale,
  Building2,
  Sparkles,
  ExternalLink,
  BarChart3,
  FileText // Added FileText import for case_number badge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DataVisualization from "../components/explorer/DataVisualization";
import AIInsightsPanel from "../components/explorer/AIInsightsPanel";
import AdvancedFilters from "../components/explorer/AdvancedFilters";
import SavedSearches from "../components/explorer/SavedSearches";
import InteractiveCharts from "../components/explorer/InteractiveCharts";
import ComparativeAnalysis from "../components/explorer/ComparativeAnalysis";
import GeographicalVisualization from "../components/explorer/GeographicalVisualization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DataExplorer() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  // Enhanced filter state
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedTribunal: "all",
    selectedOutcome: "all",
    selectedRace: "all", // This seems to be redundant with raceCategory based on the outline, but keeping it for now to match the outline.
    precedentValue: "all",
    raceCategory: "all", // This is the new, specific race category filter
    protectedGrounds: [],
    discriminationTypes: [],
    yearMin: null,
    yearMax: null,
    monetaryAwardMin: null,
    monetaryAwardMax: null
  });

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  // Load user for saved searches
  React.useEffect(() => {
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

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['tribunal-cases'],
    queryFn: () => base44.entities.TribunalCase.list('-year'),
    initialData: [],
  });

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches', user?.email],
    queryFn: () => user ? base44.entities.SavedSearch.filter({ user_email: user.email }, '-last_used') : [],
    enabled: !!user, // Only fetch if user is logged in
    initialData: [],
  });

  const createSavedSearchMutation = useMutation({
    mutationFn: async (searchData) => {
      return await base44.entities.SavedSearch.create(searchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const updateSavedSearchMutation = useMutation({
    mutationFn: async ({ searchId, updates }) => {
      return await base44.entities.SavedSearch.update(searchId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const deleteSavedSearchMutation = useMutation({
    mutationFn: async (searchId) => {
      return await base44.entities.SavedSearch.delete(searchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Text search (enhanced to include AI summary)
      const matchesSearch = !filters.searchTerm ||
        c.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.case_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.summary_en?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.ai_generated_summary?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.keywords?.some(k => k.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Basic filters
      const matchesTribunal = filters.selectedTribunal === "all" || c.tribunal === filters.selectedTribunal;
      const matchesOutcome = filters.selectedOutcome === "all" || c.outcome === filters.selectedOutcome;
      const matchesPrecedent = filters.precedentValue === "all" || c.precedent_value === filters.precedentValue;
      const matchesRaceCategory = filters.raceCategory === "all" || c.race_category === filters.raceCategory;

      // Protected grounds (must include ALL selected grounds)
      const matchesGrounds = filters.protectedGrounds.length === 0 ||
        (c.protected_ground && filters.protectedGrounds.every(ground =>
          c.protected_ground.includes(ground)
        ));

      // Discrimination types (must include ALL selected types)
      const matchesDiscriminationTypes = filters.discriminationTypes.length === 0 ||
        (c.discrimination_type && filters.discriminationTypes.every(type =>
          c.discrimination_type.includes(type)
        ));

      // Year range
      const matchesYearMin = !filters.yearMin || (c.year && c.year >= filters.yearMin);
      const matchesYearMax = !filters.yearMax || (c.year && c.year <= filters.yearMax);

      // Monetary award range
      const matchesMonetaryMin = !filters.monetaryAwardMin ||
        (c.monetary_award !== undefined && c.monetary_award >= filters.monetaryAwardMin); // Check for undefined to allow 0
      const matchesMonetaryMax = !filters.monetaryAwardMax ||
        (c.monetary_award !== undefined && c.monetary_award <= filters.monetaryAwardMax); // Check for undefined to allow 0

      return matchesSearch && matchesTribunal && matchesOutcome &&
             matchesPrecedent && matchesRaceCategory &&
             matchesGrounds && matchesDiscriminationTypes &&
             matchesYearMin && matchesYearMax &&
             matchesMonetaryMin && matchesMonetaryMax;
    });
  }, [cases, filters]);

  const years = [...new Set(cases.map(c => c.year).filter(Boolean))].sort((a, b) => b - a);
  const tribunals = [...new Set(cases.map(c => c.tribunal).filter(Boolean))];

  const outcomeColors = {
    "Upheld - Full": "bg-green-100 text-green-800 border-green-300",
    "Upheld - Partial": "bg-blue-100 text-blue-800 border-blue-300",
    "Dismissed": "bg-red-100 text-red-800 border-red-300",
    "Withdrawn": "bg-gray-100 text-gray-800 border-gray-300",
    "Settled": "bg-purple-100 text-purple-800 border-purple-300",
    "Jurisdiction Declined": "bg-orange-100 text-orange-800 border-orange-300",
  };

  const stats = useMemo(() => {
    const total = filteredCases.length;
    const upheld = filteredCases.filter(c => c.outcome?.includes("Upheld")).length;
    const dismissed = filteredCases.filter(c => c.outcome === "Dismissed").length;
    const avgAward = filteredCases
      .filter(c => c.monetary_award !== undefined && c.monetary_award > 0)
      .reduce((sum, c) => sum + c.monetary_award, 0) /
      filteredCases.filter(c => c.monetary_award !== undefined && c.monetary_award > 0).length || 0;

    return { total, upheld, dismissed, avgAward };
  }, [filteredCases]);

  const displayedCases = filteredCases.slice(0, visibleCount);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setVisibleCount(12); // Reset pagination
  };

  const handleClearAll = () => {
    setFilters({
      searchTerm: "",
      selectedTribunal: "all",
      selectedOutcome: "all",
      selectedRace: "all",
      precedentValue: "all",
      raceCategory: "all",
      protectedGrounds: [],
      discriminationTypes: [],
      yearMin: null,
      yearMax: null,
      monetaryAwardMin: null,
      monetaryAwardMax: null
    });
    setVisibleCount(12);
  };

  const handleSaveSearch = async (searchName) => {
    if (!user) return;

    await createSavedSearchMutation.mutateAsync({
      user_email: user.email,
      search_name: searchName,
      filters: filters,
      results_count: filteredCases.length,
      last_used: new Date().toISOString(),
      use_count: 1
    });
  };

  const handleLoadSearch = async (search) => {
    setFilters(search.filters);
    setVisibleCount(12);

    // Update last_used and use_count
    await updateSavedSearchMutation.mutateAsync({
      searchId: search.id,
      updates: {
        last_used: new Date().toISOString(),
        use_count: (search.use_count || 0) + 1
      }
    });
  };

  const handleDeleteSearch = async (searchId) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      await deleteSavedSearchMutation.mutateAsync(searchId);
    }
  };

  const handleToggleFavorite = async (searchId) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      await updateSavedSearchMutation.mutateAsync({
        searchId,
        updates: { is_favorite: !search.is_favorite }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 teal-gradient rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Data Explorer</h1>
              <p className="text-gray-600">Analyze 20+ years of Canadian tribunal decisions on anti-Black racism</p>
            </div>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-teal-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Filtered Cases</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700">{stats.upheld}</div>
              <div className="text-sm text-gray-600 mt-1">Cases Upheld</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-700">{stats.dismissed}</div>
              <div className="text-sm text-gray-600 mt-1">Cases Dismissed</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">
                ${(stats.avgAward / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg. Award</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Visualization Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="comparative">Comparative</TabsTrigger>
            <TabsTrigger value="geographical">Geographical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <DataVisualization cases={filteredCases} />
          </TabsContent>

          <TabsContent value="interactive" className="mt-6">
            <InteractiveCharts
              cases={filteredCases}
              onDrillDown={(data) => {
                // Handle drill-down filters if needed
                console.log('Drill-down:', data);
              }}
            />
          </TabsContent>

          <TabsContent value="comparative" className="mt-6">
            <ComparativeAnalysis cases={filteredCases} />
          </TabsContent>

          <TabsContent value="geographical" className="mt-6">
            <GeographicalVisualization cases={filteredCases} />
          </TabsContent>
        </Tabs>

        {/* Layout with Sidebar */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdvancedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              tribunals={tribunals}
              years={years}
            />

            {user && (
              <SavedSearches
                savedSearches={savedSearches}
                onLoad={handleLoadSearch}
                onSave={handleSaveSearch}
                onDelete={handleDeleteSearch}
                onToggleFavorite={handleToggleFavorite}
                currentFilters={filters}
                resultsCount={filteredCases.length}
                isSaving={createSavedSearchMutation.isPending}
                isUpdating={updateSavedSearchMutation.isPending}
                isDeleting={deleteSavedSearchMutation.isPending}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* AI Insights Toggle */}
            <div className="mb-6">
              <Button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="gold-gradient text-gray-900"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {showAIPanel ? "Hide AI Insights" : "Generate AI Insights"}
              </Button>
            </div>

            <AnimatePresence>
              {showAIPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <AIInsightsPanel cases={filteredCases} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cases List */}
            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading cases...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No cases found matching your filters.</p>
                    <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
                    <Button variant="outline" onClick={handleClearAll}>
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Case Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {displayedCases.map((tribunalCase, index) => (
                      <motion.div
                        key={tribunalCase.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-teal-500 cursor-pointer">
                          <Link to={createPageUrl(`CaseDetails?id=${tribunalCase.id}`)}>
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={
                                  tribunalCase.outcome?.includes("Upheld")
                                    ? outcomeColors["Upheld - Full"] // Assuming Upheld-Full for general upheld badge
                                    : tribunalCase.outcome?.includes("Dismissed")
                                    ? outcomeColors["Dismissed"]
                                    : outcomeColors[tribunalCase.outcome] || "bg-blue-100 text-blue-800" // Fallback
                                }>
                                  {tribunalCase.outcome}
                                </Badge>
                                {tribunalCase.precedent_value === "High" && (
                                  <Badge className="gold-gradient text-gray-900">
                                    High Precedent
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg line-clamp-2 hover:text-teal-600 transition-colors">
                                {tribunalCase.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {/* NEW: Display AI summary if available */}
                                {tribunalCase.ai_generated_summary ? (
                                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                                    {tribunalCase.ai_generated_summary}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {tribunalCase.summary_en}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {tribunalCase.case_number}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Scale className="w-3 h-3 mr-1" />
                                    {tribunalCase.tribunal}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {tribunalCase.year}
                                  </Badge>
                                  {tribunalCase.ai_generated_summary && (
                                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI Summary
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleCount < filteredCases.length && (
                    <div className="text-center">
                      <Button
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Load More Cases ({filteredCases.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
