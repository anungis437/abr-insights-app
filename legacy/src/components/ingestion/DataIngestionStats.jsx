import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function DataIngestionStats({ results }) {
  const total = results.length;
  const raceRelated = results.filter(r => r.is_race_related).length;
  const antiBlackLikely = results.filter(r => r.is_anti_black_likely).length;
  const avgConfidence = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.ai_confidence || 0), 0) / results.length * 100).toFixed(0)
    : 0;

  const stats = [
    {
      label: "Total Processed",
      value: total,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Race-Related",
      value: raceRelated,
      percentage: total > 0 ? ((raceRelated / total) * 100).toFixed(0) + "%" : "0%",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Anti-Black Likely",
      value: antiBlackLikely,
      percentage: total > 0 ? ((antiBlackLikely / total) * 100).toFixed(0) + "%" : "0%",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Avg. Confidence",
      value: avgConfidence + "%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${stat.bg} border-2`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  {stat.percentage && (
                    <span className={`text-sm font-semibold ${stat.color}`}>
                      {stat.percentage}
                    </span>
                  )}
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}