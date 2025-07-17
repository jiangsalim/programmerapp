import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Award, 
  Star, 
  Trophy, 
  BookOpen, 
  Code, 
  Target,
  Gift,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  totalXP: number;
  coursesCompleted: number;
  certificatesEarned: number;
  currentStreak: number;
  totalCP: number; // Community Points for gifting
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
    currentStreak: 0,
    totalCP: 100 // Starting CP
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch user progress to calculate stats
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id);

      if (progressError) throw progressError;

      const completedCourses = progressData?.filter(p => p.completed).length || 0;
      const totalXP = completedCourses * 100 + (progressData?.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) || 0);

      setStats(prev => ({
        ...prev,
        totalXP: Math.floor(totalXP),
        coursesCompleted: completedCourses,
        certificatesEarned: completedCourses,
        currentStreak: Math.min(completedCourses, 15) // Mock streak
      }));
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getXPToNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    return xpForNextLevel - xp;
  };

  const getLevelProgress = (xp: number) => {
    const currentLevel = getLevel(xp);
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    return (xpInCurrentLevel / 1000) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || profile?.username || user?.email?.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Level {getLevel(stats.totalXP)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  {stats.totalXP} XP
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {getLevel(stats.totalXP)}</span>
              <span>{getXPToNextLevel(stats.totalXP)} XP to next level</span>
            </div>
            <Progress value={getLevelProgress(stats.totalXP)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
            <div className="text-sm text-muted-foreground">Courses Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalCP}</div>
            <div className="text-sm text-muted-foreground">Community Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-3" />
            My Learning Progress
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Award className="h-4 w-4 mr-3" />
            View Certificates
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Code className="h-4 w-4 mr-3" />
            My Code Snippets
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Gift className="h-4 w-4 mr-3" />
            Gift Community Points
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};