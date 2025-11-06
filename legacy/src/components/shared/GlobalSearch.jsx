import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Scale, 
  BookOpen, 
  FileText,
  TrendingUp,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ cases: [], courses: [], resources: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { data: cases = [] } = useQuery({
    queryKey: ['cases-search'],
    queryFn: () => base44.entities.TribunalCase.list(),
    initialData: [],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-search'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources-search'],
    queryFn: () => base44.entities.Resource.list(),
    initialData: [],
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults({ cases: [], courses: [], resources: [] });
      return;
    }

    const searchQuery = query.toLowerCase();

    const filteredCases = cases.filter(c =>
      c.title?.toLowerCase().includes(searchQuery) ||
      c.case_number?.toLowerCase().includes(searchQuery) ||
      c.summary_en?.toLowerCase().includes(searchQuery) ||
      c.keywords?.some(k => k.toLowerCase().includes(searchQuery))
    ).slice(0, 3);

    const filteredCourses = courses.filter(c =>
      c.title_en?.toLowerCase().includes(searchQuery) ||
      c.description_en?.toLowerCase().includes(searchQuery) ||
      c.category?.toLowerCase().includes(searchQuery)
    ).slice(0, 3);

    const filteredResources = resources.filter(r =>
      r.title?.toLowerCase().includes(searchQuery) ||
      r.description?.toLowerCase().includes(searchQuery) ||
      r.tags?.some(t => t.toLowerCase().includes(searchQuery))
    ).slice(0, 3);

    setResults({
      cases: filteredCases,
      courses: filteredCourses,
      resources: filteredResources,
    });
  }, [query, cases, courses, resources]);

  const handleResultClick = (type, id) => {
    onClose();
    setQuery("");
    if (type === "case") {
      navigate(createPageUrl(`CaseDetails?id=${id}`));
    } else if (type === "course") {
      navigate(createPageUrl(`CoursePlayer?id=${id}`));
    } else if (type === "resource") {
      navigate(createPageUrl("Library"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      setQuery("");
    }
  };

  if (!isOpen) return null;

  const hasResults = results.cases.length > 0 || results.courses.length > 0 || results.resources.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="w-full max-w-3xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden shadow-2xl">
            <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  ref={inputRef}
                  placeholder="Search cases, courses, resources..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 text-lg border-2 border-teal-200 focus:border-teal-500"
                />
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Press ESC to close</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query.trim() === "" ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Start typing to search across the platform</p>
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <Scale className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Cases</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <BookOpen className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Courses</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <FileText className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Resources</p>
                    </div>
                  </div>
                </div>
              ) : hasResults ? (
                <div className="space-y-6">
                  {/* Cases */}
                  {results.cases.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Tribunal Cases</h3>
                        <Badge variant="outline">{results.cases.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {results.cases.map((caseItem) => (
                          <button
                            key={caseItem.id}
                            onClick={() => handleResultClick("case", caseItem.id)}
                            className="w-full text-left p-3 rounded-lg border hover:border-teal-500 hover:bg-teal-50 transition-all"
                          >
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {caseItem.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {caseItem.summary_en}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline">{caseItem.case_number}</Badge>
                              <Badge variant="outline">{caseItem.year}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses */}
                  {results.courses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Training Courses</h3>
                        <Badge variant="outline">{results.courses.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {results.courses.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => handleResultClick("course", course.id)}
                            className="w-full text-left p-3 rounded-lg border hover:border-teal-500 hover:bg-teal-50 transition-all"
                          >
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {course.title_en}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {course.description_en}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline">{course.level}</Badge>
                              <Badge variant="outline">{course.duration_minutes} min</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {results.resources.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Resources</h3>
                        <Badge variant="outline">{results.resources.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {results.resources.map((resource) => (
                          <button
                            key={resource.id}
                            onClick={() => handleResultClick("resource", resource.id)}
                            className="w-full text-left p-3 rounded-lg border hover:border-teal-500 hover:bg-teal-50 transition-all"
                          >
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {resource.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline">{resource.category}</Badge>
                              <Badge variant="outline">{resource.file_type}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500">Try different keywords or browse by category</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}