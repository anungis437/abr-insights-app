
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Database,
  Download,
  Filter,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Save,
  X,
  Sparkles // Added Sparkles import
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function IngestionResults({ 
  results, 
  filterRaceRelated,
  setFilterRaceRelated,
  filterAntiBlack,
  setFilterAntiBlack,
  onImport,
  isImporting,
  reviewMode,
  onToggleReviewMode,
  onManualReview,
  selectedForReview,
  onConfirmClassification,
  onReclassify
}) {
  const [reclassifyDialog, setReclassifyDialog] = useState(false);
  const [reclassifyForm, setReclassifyForm] = useState({
    is_race_related: true,
    is_anti_black_likely: false,
    grounds_detected: ['race'],
    discrimination_types: ['employment'],
    reason: ''
  });

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tribunal-cases-processed-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const openReclassifyDialog = (result) => {
    setReclassifyForm({
      is_race_related: result.is_race_related,
      is_anti_black_likely: result.is_anti_black_likely,
      grounds_detected: result.grounds_detected || ['race'],
      discrimination_types: result.discrimination_type || ['employment'],
      reason: '',
      original_classification: `Race-related: ${result.is_race_related}, Anti-Black: ${result.is_anti_black_likely}`
    });
    onManualReview(result);
    setReclassifyDialog(true);
  };

  const handleSaveReclassification = () => {
    if (selectedForReview) {
      onReclassify(selectedForReview.case_number, reclassifyForm);
      setReclassifyDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Classification Results ({results.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={reviewMode ? "default" : "outline"}
                size="sm"
                onClick={onToggleReviewMode}
                className={reviewMode ? "bg-blue-600 text-white" : ""}
              >
                <Eye className="w-4 h-4 mr-2" />
                {reviewMode ? "Review Mode On" : "Enable Review Mode"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={results.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={onImport}
                disabled={isImporting || results.length === 0}
                className="teal-gradient text-white"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Import All to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-3 flex-1">
              <Select value={filterRaceRelated} onValueChange={setFilterRaceRelated}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Race Related" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="yes">Race-Related Only</SelectItem>
                  <SelectItem value="no">Not Race-Related</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAntiBlack} onValueChange={setFilterAntiBlack}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Anti-Black" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Anti-Black Likely</SelectItem>
                  <SelectItem value="no">Not Anti-Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-gray-600">
              Showing {results.length} cases
            </span>
          </div>

          {/* Results Table */}
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No processed cases to display</p>
              <p className="text-sm text-gray-500 mt-2">Upload and process data to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-2 rounded-lg hover:shadow-md transition-all ${
                    result.manually_reviewed ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900">{result.title}</h4>
                        {result.is_race_related && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {!result.is_race_related && (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        {result.manually_reviewed && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Human Verified
                          </Badge>
                        )}
                        {result.ai_generated_summary && (
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            AI Summary
                          </Badge>
                        )}
                      </div>

                      {/* NEW: Display AI-generated summary prominently */}
                      {result.ai_generated_summary && (
                        <div className="mb-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs font-semibold text-purple-900">AI-Generated Summary</span>
                          </div>
                          <p className="text-sm text-purple-900 leading-relaxed">
                            {result.ai_generated_summary}
                          </p>
                          {result.summary_confidence && (
                            <div className="mt-2 text-xs text-purple-700">
                              Confidence: {(result.summary_confidence * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.ai_summary || result.html_excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{result.case_number}</Badge>
                        <Badge variant="outline">{result.tribunal}</Badge>
                        <Badge variant="outline">{result.year}</Badge>
                        
                        {result.is_race_related && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Race-Related
                          </Badge>
                        )}
                        
                        {result.is_anti_black_likely && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Anti-Black Likely
                          </Badge>
                        )}
                        
                        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                          {(result.ai_confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500">
                        <strong>Grounds:</strong> {result.grounds_detected?.join(', ') || 'N/A'}
                        {result.discrimination_type?.length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <strong>Types:</strong> {result.discrimination_type.join(', ')}
                          </>
                        )}
                      </div>

                      {result.ai_key_indicators && result.ai_key_indicators.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong className="text-blue-900">Key Indicators:</strong>
                          <div className="text-blue-700 mt-1">
                            {result.ai_key_indicators.slice(0, 3).join(' • ')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {result.rule_based_match && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Rules
                          </Badge>
                        )}
                        {result.llm_match && (
                          <Badge variant="outline" className="text-xs">
                            ✓ AI
                          </Badge>
                        )}
                      </div>
                      
                      {reviewMode && (
                        <div className="flex flex-col gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => onConfirmClassification(result.case_number, true)}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => openReclassifyDialog(result)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Reclassify
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reclassification Dialog */}
      <Dialog open={reclassifyDialog} onOpenChange={setReclassifyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Reclassification</DialogTitle>
            <DialogDescription>
              Override AI classification with manual review for: {selectedForReview?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Original Classification */}
            <div className="p-3 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Original AI Classification:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Race-related:</span>
                  <Badge variant={selectedForReview?.is_race_related ? "default" : "outline"}>
                    {selectedForReview?.is_race_related ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Anti-Black likely:</span>
                  <Badge variant={selectedForReview?.is_anti_black_likely ? "default" : "outline"}>
                    {selectedForReview?.is_anti_black_likely ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-semibold">{(selectedForReview?.ai_confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* New Classification */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Is this case race-related?
                </label>
                <div className="flex gap-3">
                  <Button
                    variant={reclassifyForm.is_race_related ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReclassifyForm({...reclassifyForm, is_race_related: true})}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant={!reclassifyForm.is_race_related ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReclassifyForm({...reclassifyForm, is_race_related: false})}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    No
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Is anti-Black racism specifically involved?
                </label>
                <div className="flex gap-3">
                  <Button
                    variant={reclassifyForm.is_anti_black_likely ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReclassifyForm({...reclassifyForm, is_anti_black_likely: true})}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant={!reclassifyForm.is_anti_black_likely ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReclassifyForm({...reclassifyForm, is_anti_black_likely: false})}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    No
                  </Button>
                </div>
                {reclassifyForm.is_anti_black_likely && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Only select "Yes" if the complainant is specifically Black/African Canadian
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Protected Grounds (select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['race', 'colour', 'ancestry', 'ethnic_origin', 'place_of_origin', 'age', 'disability', 'sex'].map(ground => (
                    <button
                      key={ground}
                      onClick={() => {
                        const current = reclassifyForm.grounds_detected || [];
                        setReclassifyForm({
                          ...reclassifyForm,
                          grounds_detected: current.includes(ground)
                            ? current.filter(g => g !== ground)
                            : [...current, ground]
                        });
                      }}
                      className={`px-3 py-1 rounded-lg text-sm border-2 transition-all ${
                        (reclassifyForm.grounds_detected || []).includes(ground)
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ground.replace('_', ' ')}
                      {(reclassifyForm.grounds_detected || []).includes(ground) && (
                        <CheckCircle className="w-3 h-3 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Discrimination Types (select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['employment', 'housing', 'services', 'harassment', 'education', 'contracts'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const current = reclassifyForm.discrimination_types || [];
                        setReclassifyForm({
                          ...reclassifyForm,
                          discrimination_types: current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type]
                        });
                      }}
                      className={`px-3 py-1 rounded-lg text-sm border-2 transition-all ${
                        (reclassifyForm.discrimination_types || []).includes(type)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type}
                      {(reclassifyForm.discrimination_types || []).includes(type) && (
                        <CheckCircle className="w-3 h-3 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Reason for Reclassification (Optional)
                </label>
                <Textarea
                  placeholder="Explain why you're overriding the AI classification..."
                  value={reclassifyForm.reason}
                  onChange={(e) => setReclassifyForm({...reclassifyForm, reason: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReclassifyDialog(false);
                  // Assuming setSelectedForReview is a prop or defined somewhere
                  // If not, this line might cause an error or needs adjustment based on context
                  // For now, assuming `selectedForReview` is managed via `onManualReview` and its state should be cleared by the parent
                  onManualReview(null); 
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveReclassification}
                className="teal-gradient text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reclassification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
