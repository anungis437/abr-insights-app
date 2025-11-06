import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Info } from "lucide-react";

export default function GeographicalVisualization({ cases }) {
  // Map tribunal to province/territory
  const provinceMapping = {
    "Ontario Human Rights Tribunal": "ON",
    "Quebec Human Rights Tribunal": "QC",
    "BC Human Rights Tribunal": "BC",
    "Canadian Human Rights Tribunal": "Federal",
    "Federal Court": "Federal"
  };

  const provinceData = useMemo(() => {
    const data = {};
    
    cases.forEach(c => {
      const province = provinceMapping[c.tribunal] || "Other";
      if (!data[province]) {
        data[province] = {
          code: province,
          total: 0,
          upheld: 0,
          dismissed: 0,
          totalAwards: 0,
          awardCount: 0
        };
      }
      
      data[province].total++;
      if (c.outcome?.includes("Upheld")) data[province].upheld++;
      if (c.outcome === "Dismissed") data[province].dismissed++;
      if (c.monetary_award && c.monetary_award > 0) {
        data[province].totalAwards += c.monetary_award;
        data[province].awardCount++;
      }
    });

    return Object.values(data).map(d => ({
      ...d,
      successRate: d.total > 0 ? (d.upheld / d.total) * 100 : 0,
      avgAward: d.awardCount > 0 ? d.totalAwards / d.awardCount : 0
    })).sort((a, b) => b.total - a.total);
  }, [cases]);

  // Calculate intensity for heatmap (based on case volume)
  const maxCases = Math.max(...provinceData.map(d => d.total));
  const getIntensityColor = (count) => {
    const intensity = count / maxCases;
    if (intensity > 0.7) return 'bg-red-600';
    if (intensity > 0.4) return 'bg-orange-500';
    if (intensity > 0.2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIntensityLabel = (count) => {
    const intensity = count / maxCases;
    if (intensity > 0.7) return 'Very High';
    if (intensity > 0.4) return 'High';
    if (intensity > 0.2) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Geographic Distribution Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Heatmap Legend */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Case Volume Intensity:</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-xs text-gray-600">Very High</span>
              </div>
            </div>
          </div>

          {/* Province Cards (Heatmap) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provinceData.map((province, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
                  getIntensityColor(province.total)
                } bg-opacity-10 border-current`}
              >
                <div className={`absolute top-0 right-0 w-16 h-16 ${getIntensityColor(province.total)} opacity-20 rounded-bl-full`}></div>
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{province.code}</h3>
                      <Badge className={`mt-1 ${getIntensityColor(province.total)} text-white`}>
                        {getIntensityLabel(province.total)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{province.total}</div>
                      <div className="text-xs text-gray-600">Cases</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-bold text-green-700">{province.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Upheld Cases</span>
                      <span className="font-bold text-gray-900">{province.upheld}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Dismissed Cases</span>
                      <span className="font-bold text-red-700">{province.dismissed}</span>
                    </div>
                    {province.avgAward > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-600">Avg Award</span>
                        <span className="font-bold text-yellow-700">${(province.avgAward / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Provincial Comparison */}
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Provincial Comparison
            </h4>
            <div className="space-y-2">
              {provinceData.map((province, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{province.code}</span>
                    <span className="text-sm text-gray-600">{province.total} cases</span>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getIntensityColor(province.total)} transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${(province.total / maxCases) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {province.successRate.toFixed(0)}% success
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-2">Geographic Insights</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• <strong>{provinceData[0]?.code}</strong> has the highest case volume with <strong>{provinceData[0]?.total}</strong> cases</li>
              <li>• Success rates vary from <strong>{Math.min(...provinceData.map(d => d.successRate)).toFixed(1)}%</strong> to <strong>{Math.max(...provinceData.map(d => d.successRate)).toFixed(1)}%</strong> across jurisdictions</li>
              <li>• Federal tribunals handle <strong>{provinceData.find(d => d.code === "Federal")?.total || 0}</strong> cases spanning multiple provinces</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}