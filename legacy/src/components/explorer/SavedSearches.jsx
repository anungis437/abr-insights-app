import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Save, 
  Star, 
  Trash2, 
  Search,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SavedSearches({ 
  savedSearches,
  onLoad,
  onSave,
  onDelete,
  onToggleFavorite,
  currentFilters,
  resultsCount
}) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [searchName, setSearchName] = React.useState("");

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName.trim());
      setSearchName("");
      setShowSaveDialog(false);
    }
  };

  const getFilterSummary = (filters) => {
    const parts = [];
    if (filters.searchTerm) parts.push(`"${filters.searchTerm}"`);
    if (filters.selectedTribunal && filters.selectedTribunal !== "all") 
      parts.push(filters.selectedTribunal);
    if (filters.selectedOutcome && filters.selectedOutcome !== "all") 
      parts.push(filters.selectedOutcome);
    if (filters.protectedGrounds?.length) 
      parts.push(`${filters.protectedGrounds.length} grounds`);
    if (filters.discriminationTypes?.length) 
      parts.push(`${filters.discriminationTypes.length} types`);
    if (filters.yearMin || filters.yearMax) 
      parts.push(`${filters.yearMin || '?'}-${filters.yearMax || '?'}`);
    if (filters.monetaryAwardMin || filters.monetaryAwardMax) 
      parts.push(`$${filters.monetaryAwardMin || 0}-${filters.monetaryAwardMax || '∞'}`);
    
    return parts.slice(0, 3).join(', ') + (parts.length > 3 ? '...' : '');
  };

  const hasActiveFilters = Object.values(currentFilters || {}).some(v => 
    v && ((Array.isArray(v) && v.length > 0) || (!Array.isArray(v) && v !== "all"))
  );

  return (
    <>
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-purple-600" />
              Saved Searches
            </CardTitle>
            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={!hasActiveFilters}
              size="sm"
              className="bg-purple-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No saved searches yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Apply filters and save them for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSearches
                .sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
                .map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onLoad(search)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {search.search_name}
                        </h4>
                        {search.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {getFilterSummary(search.filters)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(search.id);
                        }}
                      >
                        <Star className={`w-4 h-4 ${search.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(search.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {search.results_count} results
                    </Badge>
                    {search.last_used && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(search.last_used), 'MMM dd')}
                      </span>
                    )}
                    <span>Used {search.use_count || 0}×</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search Query</DialogTitle>
            <DialogDescription>
              Give this search configuration a name for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., High Precedent Employment Cases"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700">
              <strong>Current filters:</strong>
              <p className="mt-1">{getFilterSummary(currentFilters) || 'No filters applied'}</p>
              <p className="mt-1 text-teal-600">Results: {resultsCount}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!searchName.trim()}
              className="bg-purple-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}