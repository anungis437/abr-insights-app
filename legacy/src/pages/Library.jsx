import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Search, 
  FileText, 
  Download,
  ExternalLink,
  Filter,
  Scale,
  Calendar,
  Star,
  TrendingUp,
  BookMarked
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedPrecedent, setSelectedPrecedent] = useState("all");
  const [activeTab, setActiveTab] = useState("cases");

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['tribunal-cases-library'],
    queryFn: () => base44.entities.TribunalCase.list('-year'),
    initialData: [],
  });

  const years = [...new Set(cases.map(c => c.year))].sort((a, b) => b - a);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = searchTerm === "" || 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.summary_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesYear = selectedYear === "all" || c.year?.toString() === selectedYear;
      const matchesPrecedent = selectedPrecedent === "all" || c.precedent_value === selectedPrecedent;

      return matchesSearch && matchesYear && matchesPrecedent;
    });
  }, [cases, searchTerm, selectedYear, selectedPrecedent]);

  const resources = [
    {
      title: "Workplace Investigation Best Practices Guide",
      category: "Guide",
      description: "Comprehensive guide to conducting bias-free workplace investigations with anti-racism lens.",
      downloadUrl: "#",
      featured: true,
    },
    {
      title: "Accommodation Request Template",
      category: "Template",
      description: "Standard template for documenting and processing accommodation requests.",
      downloadUrl: "#",
    },
    {
      title: "Anti-Racism Policy Framework",
      category: "Policy",
      description: "Model policy framework for organizations committed to dismantling systemic racism.",
      downloadUrl: "#",
      featured: true,
    },
    {
      title: "Investigation Report Template",
      category: "Template",
      description: "Professional template for documenting investigation findings and recommendations.",
      downloadUrl: "#",
    },
    {
      title: "Interviewing Witnesses: A Guide",
      category: "Guide",
      description: "Best practices for conducting effective and trauma-informed witness interviews.",
      downloadUrl: "#",
    },
    {
      title: "Remedies & Resolution Checklist",
      category: "Checklist",
      description: "Step-by-step checklist for determining appropriate remedies in discrimination cases.",
      downloadUrl: "#",
    },
  ];

  const featuredCases = cases
    .filter(c => c.precedent_value === "High")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 teal-gradient rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Knowledge Library</h1>
              <p className="text-gray-600">Comprehensive legal resources and case precedents</p>
            </div>
          </div>
        </motion.div>

        {/* Featured Cases */}
        {featuredCases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured High-Precedent Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCases.map((tribunalCase, index) => (
                <motion.div
                  key={tribunalCase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all border-2 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                          <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Badge className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                            High Precedent
                          </Badge>
                          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                            {tribunalCase.title}
                          </h3>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {tribunalCase.year}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {tribunalCase.summary_en}
                      </p>
                      <Link to={createPageUrl(`CaseDetails?id=${tribunalCase.id}`)}>
                        <Button variant="outline" className="w-full">
                          Read Full Case
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Case Law
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              Guides
            </TabsTrigger>
          </TabsList>

          {/* Case Law Tab */}
          <TabsContent value="cases" className="space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search Case Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search by title, keywords, case number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedPrecedent} onValueChange={setSelectedPrecedent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Precedent Value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Precedents</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {filteredCases.length} of {cases.length} cases
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedYear("all");
                      setSelectedPrecedent("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cases List */}
            <div className="space-y-4">
              {casesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading cases...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No cases found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCases.map((tribunalCase, index) => (
                  <motion.div
                    key={tribunalCase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Scale className="w-5 h-5 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <Link to={createPageUrl(`CaseDetails?id=${tribunalCase.id}`)}>
                                  <h3 className="text-lg font-bold text-gray-900 hover:text-teal-600 transition-colors">
                                    {tribunalCase.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                  <span>{tribunalCase.case_number}</span>
                                  <span>•</span>
                                  <span>{tribunalCase.year}</span>
                                  <span>•</span>
                                  <span>{tribunalCase.tribunal}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {tribunalCase.summary_en}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {tribunalCase.precedent_value && (
                                <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                  <Star className="w-3 h-3 mr-1" />
                                  {tribunalCase.precedent_value} Precedent
                                </Badge>
                              )}
                              {tribunalCase.keywords?.slice(0, 3).map(keyword => (
                                <Badge key={keyword} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2">
                            <Link to={createPageUrl(`CaseDetails?id=${tribunalCase.id}`)}>
                              <Button size="sm" variant="outline" className="w-full">
                                <FileText className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </Link>
                            {tribunalCase.full_text_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(tribunalCase.full_text_url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-xl transition-all ${resource.featured ? 'border-2 border-teal-200' : ''}`}>
                    <CardContent className="p-6">
                      {resource.featured && (
                        <Badge className="mb-3 teal-gradient text-white border-0">
                          Featured
                        </Badge>
                      )}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {resource.category}
                          </Badge>
                          <h3 className="font-bold text-gray-900">{resource.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {resource.description}
                      </p>
                      <Button className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Guides Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  We're developing in-depth guides on workplace investigations, policy development, and more.
                </p>
                <Button className="teal-gradient text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Subscribe for Updates
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}