import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  Download,
  ZoomIn,
  ArrowLeft,
  TrendingUp,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveCharts({ cases, onDrillDown }) {
  const [drillDownLevel, setDrillDownLevel] = useState('year'); // 'year', 'tribunal', 'outcome'
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTribunal, setSelectedTribunal] = useState(null);

  // Year distribution with drill-down
  const yearData = React.useMemo(() => {
    let filteredCases = cases;
    
    if (selectedTribunal) {
      filteredCases = filteredCases.filter(c => c.tribunal === selectedTribunal);
    }

    const yearCounts = {};
    filteredCases.forEach(c => {
      const year = c.year;
      if (year) {
        if (!yearCounts[year]) {
          yearCounts[year] = {
            total: 0,
            upheld: 0,
            dismissed: 0,
            settled: 0
          };
        }
        yearCounts[year].total++;
        if (c.outcome?.includes("Upheld")) yearCounts[year].upheld++;
        if (c.outcome === "Dismissed") yearCounts[year].dismissed++;
        if (c.outcome === "Settled") yearCounts[year].settled++;
      }
    });

    return Object.entries(yearCounts)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data
      }))
      .sort((a, b) => a.year - b.year);
  }, [cases, selectedTribunal]);

  // Tribunal distribution for selected year
  const tribunalData = React.useMemo(() => {
    let filteredCases = cases;
    
    if (selectedYear) {
      filteredCases = filteredCases.filter(c => c.year === selectedYear);
    }

    const tribunalCounts = {};
    filteredCases.forEach(c => {
      const tribunal = c.tribunal || "Unknown";
      const shortName = tribunal.replace(" Human Rights Tribunal", "").replace(" Tribunal", "");
      
      if (!tribunalCounts[shortName]) {
        tribunalCounts[shortName] = {
          name: shortName,
          fullName: tribunal,
          total: 0,
          upheld: 0,
          dismissed: 0,
          avgAward: 0,
          totalAwards: 0,
          awardCount: 0
        };
      }
      
      tribunalCounts[shortName].total++;
      if (c.outcome?.includes("Upheld")) tribunalCounts[shortName].upheld++;
      if (c.outcome === "Dismissed") tribunalCounts[shortName].dismissed++;
      
      if (c.monetary_award && c.monetary_award > 0) {
        tribunalCounts[shortName].totalAwards += c.monetary_award;
        tribunalCounts[shortName].awardCount++;
      }
    });

    return Object.values(tribunalCounts).map(t => ({
      ...t,
      avgAward: t.awardCount > 0 ? Math.round(t.totalAwards / t.awardCount) : 0,
      successRate: t.total > 0 ? Math.round((t.upheld / t.total) * 100) : 0
    }));
  }, [cases, selectedYear]);

  // Outcome breakdown for selected year and/or tribunal
  const outcomeData = React.useMemo(() => {
    let filteredCases = cases;
    
    if (selectedYear) {
      filteredCases = filteredCases.filter(c => c.year === selectedYear);
    }
    if (selectedTribunal) {
      filteredCases = filteredCases.filter(c => c.tribunal === selectedTribunal);
    }

    const outcomes = {};
    filteredCases.forEach(c => {
      outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
    });

    return Object.entries(outcomes).map(([name, value]) => ({ 
      name, 
      value,
      percentage: Math.round((value / filteredCases.length) * 100)
    }));
  }, [cases, selectedYear, selectedTribunal]);

  const COLORS = {
    "Upheld - Full": "#10b981",
    "Upheld - Partial": "#3b82f6",
    "Dismissed": "#ef4444",
    "Settled": "#8b5cf6",
    "Withdrawn": "#6b7280",
    "Jurisdiction Declined": "#f97316",
  };

  const handleYearClick = (data) => {
    setSelectedYear(data.year);
    setDrillDownLevel('tribunal');
    onDrillDown && onDrillDown({ type: 'year', value: data.year });
  };

  const handleTribunalClick = (data) => {
    setSelectedTribunal(data.fullName);
    setDrillDownLevel('outcome');
    onDrillDown && onDrillDown({ type: 'tribunal', value: data.fullName });
  };

  const handleReset = () => {
    setSelectedYear(null);
    setSelectedTribunal(null);
    setDrillDownLevel('year');
    onDrillDown && onDrillDown({ type: 'reset' });
  };

  const exportChart = (chartId, filename) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // Use html2canvas or similar library in production
    // For now, we'll create a simple export prompt
    const dataUrl = chartElement.toDataURL?.('image/png');
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      alert('Chart export functionality requires additional setup. In production, use libraries like html2canvas.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(selectedYear || selectedTribunal) && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Reset View
            </Button>
          )}
          <div className="flex items-center gap-2">
            {selectedYear && (
              <Badge variant="outline" className="border-teal-300 text-teal-700">
                Year: {selectedYear}
              </Badge>
            )}
            {selectedTribunal && (
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                {selectedTribunal.replace(" Human Rights Tribunal", "")}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportChart('interactive-chart', 'chart-export')}>
          <Download className="w-4 h-4 mr-2" />
          Export Chart
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {/* Level 1: Year Overview */}
        {drillDownLevel === 'year' && (
          <motion.div
            key="year-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="w-5 h-5 text-teal-600" />
                  Cases by Year (Click to drill down)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="year-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={yearData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
                                <p className="font-bold text-gray-900">{data.year}</p>
                                <p className="text-sm text-gray-700">Total: {data.total}</p>
                                <p className="text-sm text-green-700">Upheld: {data.upheld}</p>
                                <p className="text-sm text-red-700">Dismissed: {data.dismissed}</p>
                                <p className="text-xs text-gray-500 mt-2 italic">Click to drill down</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="upheld" 
                        stackId="a" 
                        fill="#10b981" 
                        name="Upheld"
                        cursor="pointer"
                        onClick={handleYearClick}
                      />
                      <Bar 
                        dataKey="dismissed" 
                        stackId="a" 
                        fill="#ef4444" 
                        name="Dismissed"
                        cursor="pointer"
                        onClick={handleYearClick}
                      />
                      <Bar 
                        dataKey="settled" 
                        stackId="a" 
                        fill="#8b5cf6" 
                        name="Settled"
                        cursor="pointer"
                        onClick={handleYearClick}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-900">
                    Click on any year to see detailed breakdown by tribunal
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Level 2: Tribunal Breakdown */}
        {drillDownLevel === 'tribunal' && selectedYear && (
          <motion.div
            key="tribunal-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Tribunals in {selectedYear} (Click to see outcomes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="tribunal-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={tribunalData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
                                <p className="font-bold text-gray-900">{data.fullName}</p>
                                <p className="text-sm text-gray-700">Total Cases: {data.total}</p>
                                <p className="text-sm text-green-700">Success Rate: {data.successRate}%</p>
                                <p className="text-sm text-yellow-700">Avg Award: ${data.avgAward.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-2 italic">Click for outcomes</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="total" 
                        fill="#0d9488" 
                        name="Total Cases"
                        cursor="pointer"
                        onClick={handleTribunalClick}
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Level 3: Outcome Breakdown */}
        {drillDownLevel === 'outcome' && (selectedYear || selectedTribunal) && (
          <motion.div
            key="outcome-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Outcome Distribution
                  {selectedYear && ` - ${selectedYear}`}
                  {selectedTribunal && ` - ${selectedTribunal.replace(" Human Rights Tribunal", "")}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="outcome-chart" className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name.split(' - ')[0]}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-4">Detailed Breakdown:</h4>
                    {outcomeData.map((outcome, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[outcome.name] || '#6b7280' }}
                          />
                          <span className="text-sm font-medium text-gray-900">{outcome.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{outcome.value}</div>
                          <div className="text-xs text-gray-600">{outcome.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}