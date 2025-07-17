import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  totalXP: number;
  coursesCompleted: number;
  rank: number;
}

export const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly" | "all">("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Get user progress for each user
      const leaderboardData: LeaderboardUser[] = [];
      
      for (const profile of profiles || []) {
        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", profile.user_id);

        if (progressError) continue;

        const completedCourses = progressData?.filter(p => p.completed).length || 0;
        const totalXP = completedCourses * 100 + (progressData?.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) || 0);

        leaderboardData.push({
          id: profile.user_id,
          username: profile.username || profile.full_name || 'Anonymous',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          totalXP: Math.floor(totalXP),
          coursesCompleted: completedCourses,
          rank: 0
        });
      }

      // Sort by XP and assign ranks
      leaderboardData.sort((a, b) => b.totalXP - a.totalXP);
      leaderboardData.forEach((user, index) => {
        user.rank = index + 1;
      });

      setUsers(leaderboardData.slice(0, 50)); // Top 50 users
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-card";
    }
  };

  const getLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Time Frame Selector */}
          <div className="flex gap-2 mb-6">
            {["all", "monthly", "weekly"].map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFrame === frame
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
          </div>

          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 mx-auto mb-2 ring-2 ring-gray-400">
                    <AvatarImage src={users[1]?.avatar_url} />
                    <AvatarFallback className="bg-gray-400 text-white">
                      {users[1]?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    <Medal className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="font-semibold text-sm">{users[1]?.username}</p>
                <p className="text-xs text-muted-foreground">{users[1]?.totalXP} XP</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-yellow-500">
                    <AvatarImage src={users[0]?.avatar_url} />
                    <AvatarFallback className="bg-yellow-500 text-white">
                      {users[0]?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <p className="font-bold">{users[0]?.username}</p>
                <p className="text-sm text-muted-foreground">{users[0]?.totalXP} XP</p>
                <Badge className="bg-yellow-500 text-white">Champion</Badge>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 mx-auto mb-2 ring-2 ring-amber-600">
                    <AvatarImage src={users[2]?.avatar_url} />
                    <AvatarFallback className="bg-amber-600 text-white">
                      {users[2]?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="font-semibold text-sm">{users[2]?.username}</p>
                <p className="text-xs text-muted-foreground">{users[2]?.totalXP} XP</p>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="space-y-2">
            {users.map((user) => (
              <Card 
                key={user.id} 
                className={`${getRankColor(user.rank)} ${
                  user.rank <= 3 ? 'ring-2 ring-opacity-50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-semibold">{user.username}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Level {getLevel(user.totalXP)}</span>
                        <span>•</span>
                        <span>{user.coursesCompleted} courses</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{user.totalXP}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};