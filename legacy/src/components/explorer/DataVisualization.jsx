import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Scale, 
  AlertCircle,
  Sparkles,
  Award
} from "lucide-react";

export default function DataVisualization({ cases }) {
  // 1. Cases by Year Distribution
  const yearDistribution = useMemo(() => {
    const yearCounts = {};
    cases.forEach(c => {
      const year = c.year;
      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [cases]);

  // 2. Outcome Distribution
  const outcomeData = useMemo(() => {
    const outcomes = {};
    cases.forEach(c => {
      outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
    });
    return Object.entries(outcomes).map(([name, value]) => ({ name, value }));
  }, [cases]);

  // 3. Top Protected Grounds
  const protectedGroundsData = useMemo(() => {
    const grounds = {};
    cases.forEach(c => {
      c.protected_ground?.forEach(ground => {
        grounds[ground] = (grounds[ground] || 0) + 1;
      });
    });
    return Object.entries(grounds)
      .map(([name, value]) => ({ 
        name: name.replace(/_/g, ' ').charAt(0).toUpperCase() + name.replace(/_/g, ' ').slice(1), 
        value 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [cases]);

  // 4. Top Discrimination Types
  const discriminationTypesData = useMemo(() => {
    const types = {};
    cases.forEach(c => {
      c.discrimination_type?.forEach(type => {
        types[type] = (types[type] || 0) + 1;
      });
    });
    return Object.entries(types)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }))
      .sort((a, b) => b.value - a.value);
  }, [cases]);

  // 5. Average Monetary Awards Over Time
  const monetaryAwardsOverTime = useMemo(() => {
    const yearlyAwards = {};
    cases.forEach(c => {
      if (c.year && c.monetary_award !== undefined && c.monetary_award > 0) {
        if (!yearlyAwards[c.year]) {
          yearlyAwards[c.year] = { total: 0, count: 0 };
        }
        yearlyAwards[c.year].total += c.monetary_award;
        yearlyAwards[c.year].count += 1;
      }
    });
    return Object.entries(yearlyAwards)
      .map(([year, data]) => ({
        year: parseInt(year),
        average: Math.round(data.total / data.count),
        count: data.count
      }))
      .sort((a, b) => a.year - b.year);
  }, [cases]);

  // 6. Yearly Trends (Upheld vs Dismissed)
  const yearlyTrends = useMemo(() => {
    const trends = {};
    cases.forEach(c => {
      const year = c.year;
      if (!trends[year]) {
        trends[year] = { year, total: 0, upheld: 0, dismissed: 0 };
      }
      trends[year].total++;
      if (c.outcome?.includes("Upheld")) trends[year].upheld++;
      if (c.outcome === "Dismissed") trends[year].dismissed++;
    });
    return Object.values(trends).sort((a, b) => a.year - b.year);
  }, [cases]);

  // 7. Tribunal Distribution
  const tribunalDistribution = useMemo(() => {
    const dist = {};
    cases.forEach(c => {
      const tribunal = c.tribunal || "Unknown";
      dist[tribunal] = (dist[tribunal] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ 
      name: name.replace(" Human Rights Tribunal", "").replace(" Tribunal", ""),
      value 
    }));
  }, [cases]);

  // 8. AI Summary Coverage
  const aiSummaryCoverage = useMemo(() => {
    const withAI = cases.filter(c => c.ai_generated_summary).length;
    const withoutAI = cases.length - withAI;
    return [
      { name: "With AI Summary", value: withAI, color: "#8b5cf6" },
      { name: "Without AI Summary", value: withoutAI, color: "#e5e7eb" }
    ];
  }, [cases]);

  // 9. Precedent Value Distribution
  const precedentData = useMemo(() => {
    const precedents = { High: 0, Medium: 0, Low: 0 };
    cases.forEach(c => {
      if (c.precedent_value) {
        precedents[c.precedent_value] = (precedents[c.precedent_value] || 0) + 1;
      }
    });
    return Object.entries(precedents).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];
  const OUTCOME_COLORS = {
    "Upheld - Full": "#10b981",
    "Upheld - Partial": "#3b82f6",
    "Dismissed": "#ef4444",
    "Settled": "#8b5cf6",
    "Withdrawn": "#6b7280",
    "Jurisdiction Declined": "#f97316",
  };

  // Calculate key statistics
  const stats = useMemo(() => {
    const totalCases = cases.length;
    const casesWithAwards = cases.filter(c => c.monetary_award && c.monetary_award > 0);
    const totalAwards = casesWithAwards.reduce((sum, c) => sum + c.monetary_award, 0);
    const avgAward = casesWithAwards.length > 0 ? totalAwards / casesWithAwards.length : 0;
    const upheldRate = cases.length > 0 
      ? (cases.filter(c => c.outcome?.includes("Upheld")).length / cases.length) * 100 
      : 0;
    const aiCoverageRate = cases.length > 0
      ? (cases.filter(c => c.ai_generated_summary).length / cases.length) * 100
      : 0;

    return { totalCases, avgAward, upheldRate, aiCoverageRate, totalAwards };
  }, [cases]);

  return (
    <div className="space-y-6 mb-8">
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Cases</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCases}</div>
              </div>
              <Scale className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Upheld Rate</div>
                <div className="text-2xl font-bold text-green-700">{stats.upheldRate.toFixed(1)}%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg. Award</div>
                <div className="text-2xl font-bold text-yellow-700">${(stats.avgAward / 1000).toFixed(0)}K</div>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">AI Coverage</div>
                <div className="text-2xl font-bold text-purple-700">{stats.aiCoverageRate.toFixed(0)}%</div>
              </div>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Awards</div>
                <div className="text-2xl font-bold text-orange-700">${(stats.totalAwards / 1000000).toFixed(1)}M</div>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Cases by Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Cases by Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yearDistribution}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  name="Cases"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Outcome Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              Case Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' - ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Protected Grounds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-teal-600" />
              Top Protected Grounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={protectedGroundsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Discrimination Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              Discrimination Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={discriminationTypesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Average Monetary Awards Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
              Average Monetary Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monetaryAwardsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  name="Avg Award" 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Yearly Trends (Upheld vs Dismissed) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Outcome Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={3} name="Total Cases" />
                <Line type="monotone" dataKey="upheld" stroke="#10b981" strokeWidth={2} name="Upheld" />
                <Line type="monotone" dataKey="dismissed" stroke="#ef4444" strokeWidth={2} name="Dismissed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 7. AI Summary Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Summary Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aiSummaryCoverage}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {aiSummaryCoverage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>{aiSummaryCoverage[0].value}</strong> cases include AI-generated summaries 
                focusing on core findings and legal rationale.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 8. Precedent Value Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Precedent Value Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={precedentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {precedentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'High' ? '#f59e0b' :
                        entry.name === 'Medium' ? '#3b82f6' :
                        '#6b7280'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Key Insights from Filtered Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Success Rate</h4>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">{stats.upheldRate.toFixed(1)}%</strong> of cases were upheld 
                (fully or partially), indicating significant findings of discrimination.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Financial Impact</h4>
              <p className="text-sm text-gray-700">
                Average monetary award: <strong className="text-yellow-600">${stats.avgAward.toLocaleString()}</strong>, 
                totaling <strong>${(stats.totalAwards / 1000000).toFixed(1)}M</strong> across all cases.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Most Common Ground</h4>
              <p className="text-sm text-gray-700">
                <strong className="text-teal-600">{protectedGroundsData[0]?.name || 'N/A'}</strong> is the most 
                frequently cited protected ground with {protectedGroundsData[0]?.value || 0} cases.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">AI Enhancement</h4>
              <p className="text-sm text-gray-700">
                <strong className="text-purple-600">{stats.aiCoverageRate.toFixed(0)}%</strong> of cases feature 
                AI-generated summaries for rapid understanding of findings and rationale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}