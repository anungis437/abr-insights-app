import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  X, 
  Save,
  Star,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  onClearAll,
  tribunals,
  years
}) {
  const [expandedSections, setExpandedSections] = React.useState({
    basic: true,
    grounds: false,
    discrimination: false,
    monetary: false,
    advanced: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const protectedGroundsOptions = [
    "race", "colour", "ancestry", "place_of_origin", "ethnic_origin",
    "citizenship", "creed", "sex", "age", "disability", 
    "sexual_orientation", "gender_identity", "family_status", "marital_status"
  ];

  const discriminationTypesOptions = [
    "employment", "housing", "services", "education", 
    "contracts", "harassment", "reprisal"
  ];

  const raceCategoryOptions = [
    "Black/African Canadian", "Indigenous", "Asian", 
    "Middle Eastern", "Latin American", "Mixed Race", "Other"
  ];

  const toggleArrayFilter = (filterKey, value) => {
    const current = filters[filterKey] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ [filterKey]: updated });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm ||
      filters.selectedTribunal !== "all" ||
      filters.selectedOutcome !== "all" ||
      filters.precedentValue !== "all" ||
      filters.raceCategory !== "all" ||
      (filters.protectedGrounds && filters.protectedGrounds.length > 0) ||
      (filters.discriminationTypes && filters.discriminationTypes.length > 0) ||
      filters.yearMin ||
      filters.yearMax ||
      filters.monetaryAwardMin ||
      filters.monetaryAwardMax;
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Advanced Filters
            {hasActiveFilters() && (
              <Badge className="bg-blue-600 text-white">Active</Badge>
            )}
          </CardTitle>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search & Filters */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-900"
          >
            <span>Basic Search</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.basic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Input
                  placeholder="Search by title, case number, keywords, or AI summary..."
                  value={filters.searchTerm || ""}
                  onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                />

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Tribunal
                    </label>
                    <Select 
                      value={filters.selectedTribunal || "all"} 
                      onValueChange={(value) => onFilterChange({ selectedTribunal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tribunals</SelectItem>
                        {tribunals.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Outcome
                    </label>
                    <Select 
                      value={filters.selectedOutcome || "all"} 
                      onValueChange={(value) => onFilterChange({ selectedOutcome: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Outcomes</SelectItem>
                        <SelectItem value="Upheld - Full">Upheld - Full</SelectItem>
                        <SelectItem value="Upheld - Partial">Upheld - Partial</SelectItem>
                        <SelectItem value="Dismissed">Dismissed</SelectItem>
                        <SelectItem value="Settled">Settled</SelectItem>
                        <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                        <SelectItem value="Jurisdiction Declined">Jurisdiction Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Precedent Value
                    </label>
                    <Select 
                      value={filters.precedentValue || "all"} 
                      onValueChange={(value) => onFilterChange({ precedentValue: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Precedents</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Race Category
                    </label>
                    <Select 
                      value={filters.raceCategory || "all"} 
                      onValueChange={(value) => onFilterChange({ raceCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {raceCategoryOptions.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Protected Grounds */}
        <div className="space-y-3 border-t pt-4">
          <button
            onClick={() => toggleSection('grounds')}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-900"
          >
            <span>
              Protected Grounds
              {filters.protectedGrounds?.length > 0 && (
                <Badge className="ml-2 bg-teal-600 text-white text-xs">
                  {filters.protectedGrounds.length}
                </Badge>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.grounds ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.grounds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {protectedGroundsOptions.map(ground => (
                  <div key={ground} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ground-${ground}`}
                      checked={filters.protectedGrounds?.includes(ground)}
                      onCheckedChange={() => toggleArrayFilter('protectedGrounds', ground)}
                    />
                    <label
                      htmlFor={`ground-${ground}`}
                      className="text-xs text-gray-700 cursor-pointer capitalize"
                    >
                      {ground.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discrimination Types */}
        <div className="space-y-3 border-t pt-4">
          <button
            onClick={() => toggleSection('discrimination')}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-900"
          >
            <span>
              Discrimination Types
              {filters.discriminationTypes?.length > 0 && (
                <Badge className="ml-2 bg-purple-600 text-white text-xs">
                  {filters.discriminationTypes.length}
                </Badge>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.discrimination ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.discrimination && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                {discriminationTypesOptions.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.discriminationTypes?.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('discriminationTypes', type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-xs text-gray-700 cursor-pointer capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Year Range */}
        <div className="space-y-3 border-t pt-4">
          <button
            onClick={() => toggleSection('advanced')}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-900"
          >
            <span>Year & Monetary Ranges</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.advanced ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.advanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Year Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min year"
                        value={filters.yearMin || ""}
                        onChange={(e) => onFilterChange({ yearMin: e.target.value ? Number(e.target.value) : null })}
                        min={Math.min(...years)}
                        max={Math.max(...years)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max year"
                        value={filters.yearMax || ""}
                        onChange={(e) => onFilterChange({ yearMax: e.target.value ? Number(e.target.value) : null })}
                        min={Math.min(...years)}
                        max={Math.max(...years)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Monetary Award Range (CAD)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min $"
                        value={filters.monetaryAwardMin || ""}
                        onChange={(e) => onFilterChange({ monetaryAwardMin: e.target.value ? Number(e.target.value) : null })}
                        min={0}
                        step={1000}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max $"
                        value={filters.monetaryAwardMax || ""}
                        onChange={(e) => onFilterChange({ monetaryAwardMax: e.target.value ? Number(e.target.value) : null })}
                        min={0}
                        step={1000}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}