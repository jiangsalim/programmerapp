import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  BookOpen, 
  CheckCircle, 
  Bot, 
  Play, 
  Share2, 
  Plus,
  Settings,
  LogOut,
  Crown,
  Users,
  FileText,
  Terminal
} from 'lucide-react';
import { NotesSection } from '@/components/dashboard/NotesSection';
import { TasksSection } from '@/components/dashboard/TasksSection';
import { CodeEditor } from '@/components/dashboard/CodeEditor';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { AdminPanel } from '@/components/dashboard/AdminPanel';
import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { ChallengesSection } from '@/components/dashboard/ChallengesSection';
import { SocialSection } from '@/components/dashboard/SocialSection';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { UserProfile } from '@/components/ui/user-profile';
import { Leaderboard } from '@/components/ui/leaderboard';

const Dashboard = () => {
  const { user, signOut, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('learn');
  const [stats, setStats] = useState({
    totalNotes: 0,
    completedTasks: 0,
    codeSnippets: 0,
    aiConversations: 0
  });

  useEffect(() => {
    if (!user && !loading) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'learn':
        return <CoursesSection />;
      case 'community':
        return <SocialSection />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'create':
        return (
          <div className="min-h-screen bg-background p-4 pb-24">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create & Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code Editor
                      </h3>
                      <CodeEditor />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        AI Assistant
                      </h3>
                      <AIAssistant />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Programming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TasksSection />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes & Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NotesSection />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Coding Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChallengesSection />
                </CardContent>
              </Card>
              
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Admin Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdminPanel />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      case 'profile':
        return <UserProfile />;
      default:
        return <CoursesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;