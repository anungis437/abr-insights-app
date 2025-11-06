import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  GitCompare,
  TrendingUp,
  Download,
  AlertCircle
} from "lucide-react";

export default function ComparativeAnalysis({ cases }) {
  const [compareMode, setCompareMode] = useState('tribunals'); // 'tribunals' or 'time_periods'
  const [selectedTribunal1, setSelectedTribunal1] = useState('');
  const [selectedTribunal2, setSelectedTribunal2] = useState('');
  const [selectedPeriod1, setSelectedPeriod1] = useState('');
  const [selectedPeriod2, setSelectedPeriod2] = useState('');

  const tribunals = useMemo(() => 
    [...new Set(cases.map(c => c.tribunal).filter(Boolean))],
    [cases]
  );

  const years = useMemo(() => 
    [...new Set(cases.map(c => c.year).filter(Boolean))].sort((a, b) => b - a),
    [cases]
  );

  // Generate time periods (5-year ranges)
  const timePeriods = useMemo(() => {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const periods = [];
    
    for (let start = minYear; start <= maxYear; start += 5) {
      const end = Math.min(start + 4, maxYear);
      periods.push({
        label: `${start}-${end}`,
        start,
        end
      });
    }
    
    return periods;
  }, [years]);

  // Comparative tribunal analysis
  const tribunalComparison = useMemo(() => {
    if (!selectedTribunal1 || !selectedTribunal2) return null;

    const analyzeTribunal = (tribunalName) => {
      const tribunalCases = cases.filter(c => c.tribunal === tribunalName);
      const upheld = tribunalCases.filter(c => c.outcome?.includes("Upheld")).length;
      const dismissed = tribunalCases.filter(c => c.outcome === "Dismissed").length;
      const casesWithAwards = tribunalCases.filter(c => c.monetary_award && c.monetary_award > 0);
      const avgAward = casesWithAwards.length > 0
        ? casesWithAwards.reduce((sum, c) => sum + c.monetary_award, 0) / casesWithAwards.length
        : 0;

      return {
        name: tribunalName.replace(" Human Rights Tribunal", "").replace(" Tribunal", ""),
        fullName: tribunalName,
        totalCases: tribunalCases.length,
        upheld,
        dismissed,
        successRate: tribunalCases.length > 0 ? (upheld / tribunalCases.length) * 100 : 0,
        avgAward: Math.round(avgAward),
        casesWithAwards: casesWithAwards.length
      };
    };

    const data1 = analyzeTribunal(selectedTribunal1);
    const data2 = analyzeTribunal(selectedTribunal2);

    // Create comparative chart data
    return {
      tribunals: [data1, data2],
      comparison: [
        { metric: 'Total Cases', [data1.name]: data1.totalCases, [data2.name]: data2.totalCases },
        { metric: 'Upheld', [data1.name]: data1.upheld, [data2.name]: data2.upheld },
        { metric: 'Dismissed', [data1.name]: data1.dismissed, [data2.name]: data2.dismissed },
        { metric: 'Success Rate %', [data1.name]: data1.successRate.toFixed(1), [data2.name]: data2.successRate.toFixed(1) }
      ],
      radar: [
        {
          metric: 'Total Cases',
          [data1.name]: (data1.totalCases / Math.max(data1.totalCases, data2.totalCases)) * 100,
          [data2.name]: (data2.totalCases / Math.max(data1.totalCases, data2.totalCases)) * 100
        },
        {
          metric: 'Success Rate',
          [data1.name]: data1.successRate,
          [data2.name]: data2.successRate
        },
        {
          metric: 'Avg Award ($K)',
          [data1.name]: (data1.avgAward / 1000 / Math.max(data1.avgAward / 1000, data2.avgAward / 1000)) * 100,
          [data2.name]: (data2.avgAward / 1000 / Math.max(data1.avgAward / 1000, data2.avgAward / 1000)) * 100
        }
      ]
    };
  }, [cases, selectedTribunal1, selectedTribunal2]);

  // Comparative time period analysis
  const periodComparison = useMemo(() => {
    if (!selectedPeriod1 || !selectedPeriod2) return null;

    const period1 = timePeriods.find(p => p.label === selectedPeriod1);
    const period2 = timePeriods.find(p => p.label === selectedPeriod2);

    if (!period1 || !period2) return null;

    const analyzePeriod = (period) => {
      const periodCases = cases.filter(c => c.year >= period.start && c.year <= period.end);
      const upheld = periodCases.filter(c => c.outcome?.includes("Upheld")).length;
      const dismissed = periodCases.filter(c => c.outcome === "Dismissed").length;
      const casesWithAwards = periodCases.filter(c => c.monetary_award && c.monetary_award > 0);
      const avgAward = casesWithAwards.length > 0
        ? casesWithAwards.reduce((sum, c) => sum + c.monetary_award, 0) / casesWithAwards.length
        : 0;

      return {
        name: period.label,
        totalCases: periodCases.length,
        upheld,
        dismissed,
        successRate: periodCases.length > 0 ? (upheld / periodCases.length) * 100 : 0,
        avgAward: Math.round(avgAward),
        casesPerYear: periodCases.length / (period.end - period.start + 1)
      };
    };

    const data1 = analyzePeriod(period1);
    const data2 = analyzePeriod(period2);

    return {
      periods: [data1, data2],
      comparison: [
        { metric: 'Total Cases', [data1.name]: data1.totalCases, [data2.name]: data2.totalCases },
        { metric: 'Upheld', [data1.name]: data1.upheld, [data2.name]: data2.upheld },
        { metric: 'Cases/Year', [data1.name]: data1.casesPerYear.toFixed(1), [data2.name]: data2.casesPerYear.toFixed(1) },
        { metric: 'Success Rate %', [data1.name]: data1.successRate.toFixed(1), [data2.name]: data2.successRate.toFixed(1) }
      ]
    };
  }, [cases, selectedPeriod1, selectedPeriod2, timePeriods]);

  const exportComparison = () => {
    alert('Export functionality: In production, this would generate a PDF report with all comparative visualizations.');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            Comparative Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Compare By:</label>
            <Select value={compareMode} onValueChange={setCompareMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tribunals">Tribunals</SelectItem>
                <SelectItem value="time_periods">Time Periods</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tribunal Comparison */}
          {compareMode === 'tribunals' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tribunal 1:</label>
                <Select value={selectedTribunal1} onValueChange={setSelectedTribunal1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first tribunal" />
                  </SelectTrigger>
                  <SelectContent>
                    {tribunals.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tribunal 2:</label>
                <Select value={selectedTribunal2} onValueChange={setSelectedTribunal2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second tribunal" />
                  </SelectTrigger>
                  <SelectContent>
                    {tribunals.filter(t => t !== selectedTribunal1).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Time Period Comparison */}
          {compareMode === 'time_periods' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Period 1:</label>
                <Select value={selectedPeriod1} onValueChange={setSelectedPeriod1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first period" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriods.map(p => (
                      <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Period 2:</label>
                <Select value={selectedPeriod2} onValueChange={setSelectedPeriod2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second period" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePeriods.filter(p => p.label !== selectedPeriod1).map(p => (
                      <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button onClick={exportComparison} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Comparison Report
          </Button>
        </CardContent>
      </Card>

      {/* Tribunal Comparison Results */}
      {compareMode === 'tribunals' && tribunalComparison && (
        <div className="space-y-6">
          {/* Comparative Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparative Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={tribunalComparison.comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={tribunalComparison.tribunals[0].name} fill="#0d9488" />
                  <Bar dataKey={tribunalComparison.tribunals[1].name} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={tribunalComparison.radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name={tribunalComparison.tribunals[0].name} 
                    dataKey={tribunalComparison.tribunals[0].name} 
                    stroke="#0d9488" 
                    fill="#0d9488" 
                    fillOpacity={0.5} 
                  />
                  <Radar 
                    name={tribunalComparison.tribunals[1].name} 
                    dataKey={tribunalComparison.tribunals[1].name} 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.5} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tribunalComparison.tribunals.map((tribunal, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">{tribunal.fullName}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Total Cases:</span>
                      <span className="ml-2 font-bold text-gray-900">{tribunal.totalCases}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="ml-2 font-bold text-green-700">{tribunal.successRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Award:</span>
                      <span className="ml-2 font-bold text-yellow-700">${tribunal.avgAward.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cases with Awards:</span>
                      <span className="ml-2 font-bold text-gray-900">{tribunal.casesWithAwards}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Period Comparison Results */}
      {compareMode === 'time_periods' && periodComparison && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Period-Over-Period Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={periodComparison.comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={periodComparison.periods[0].name} fill="#3b82f6" />
                  <Bar dataKey={periodComparison.periods[1].name} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {periodComparison.periods.map((period, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border-2">
                    <h4 className="font-semibold text-gray-900 mb-3">{period.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cases:</span>
                        <span className="font-bold">{period.totalCases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cases/Year:</span>
                        <span className="font-bold">{period.casesPerYear.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-bold text-green-700">{period.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Award:</span>
                        <span className="font-bold text-yellow-700">${period.avgAward.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>Interpretation:</strong> Compare case volumes and success rates across different time periods 
                    to identify trends in tribunal decision-making and systemic patterns in anti-Black racism cases.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {compareMode === 'tribunals' && (!selectedTribunal1 || !selectedTribunal2) && (
        <Card>
          <CardContent className="py-12 text-center">
            <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select two tribunals to begin comparative analysis</p>
          </CardContent>
        </Card>
      )}

      {compareMode === 'time_periods' && (!selectedPeriod1 || !selectedPeriod2) && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select two time periods to analyze trends</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}