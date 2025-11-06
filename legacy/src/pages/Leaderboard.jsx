import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import LeaderboardComponent from "../components/gamification/Leaderboard";

export default function LeaderboardPage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements-leaderboard'],
    queryFn: () => base44.entities.UserAchievement.list('-total_points'),
    initialData: [],
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-leaderboard', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orgs = await base44.entities.Organization.list();
      return orgs.filter(org => 
        org.admin_email === user.email || 
        org.member_emails?.includes(user.email)
      );
    },
    enabled: !!user,
    initialData: [],
  });

  useEffect(() => {
    if (organizations.length > 0) {
      setOrganization(organizations[0]);
    }
  }, [organizations]);

  const orgAchievements = organization 
    ? allAchievements.filter(a => 
        [...(organization.member_emails || []), organization.admin_email].includes(a.user_email)
      )
    : allAchievements;

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
            <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-gray-600">See how you rank among top learners</p>
            </div>
          </div>
        </motion.div>

        {/* My Rank Card */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Current Rank</p>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-900">
                      #{orgAchievements.findIndex(a => a.user_email === user.email) + 1 || '—'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {orgAchievements.find(a => a.user_email === user.email)?.total_points || 0} points
                      </p>
                      <p className="text-xs text-gray-500">
                        Keep learning to climb the ranks!
                      </p>
                    </div>
                  </div>
                </div>
                {organization && (
                  <Badge variant="outline" className="border-teal-300 text-teal-700">
                    {organization.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <LeaderboardComponent 
          achievements={orgAchievements} 
          organization={organization}
        />
      </div>
    </div>
  );
}