import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  Code, 
  MessageSquare, 
  Crown, 
  Shield, 
  User,
  TrendingUp,
  Activity
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  }[];
  user_roles: {
    role: string;
  }[];
}

interface Stats {
  totalUsers: number;
  totalNotes: number;
  totalSnippets: number;
  totalTasks: number;
  totalConversations: number;
  publicContent: number;
}

export const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalNotes: 0,
    totalSnippets: 0,
    totalTasks: 0,
    totalConversations: 0,
    publicContent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      // Fetch users with profiles and roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `);

      if (usersError) throw usersError;

      setUsers(usersData as any || []);

      // Fetch statistics
      const [notesCount, snippetsCount, tasksCount, conversationsCount] = await Promise.all([
        supabase.from('programming_notes').select('id', { count: 'exact' }),
        supabase.from('code_snippets').select('id', { count: 'exact' }),
        supabase.from('programming_tasks').select('id', { count: 'exact' }),
        supabase.from('ai_conversations').select('id', { count: 'exact' })
      ]);

      const publicNotesCount = await supabase
        .from('programming_notes')
        .select('id', { count: 'exact' })
        .eq('is_public', true);

      const publicSnippetsCount = await supabase
        .from('code_snippets')
        .select('id', { count: 'exact' })
        .eq('is_public', true);

      setStats({
        totalUsers: usersData?.length || 0,
        totalNotes: notesCount.count || 0,
        totalSnippets: snippetsCount.count || 0,
        totalTasks: tasksCount.count || 0,
        totalConversations: conversationsCount.count || 0,
        publicContent: (publicNotesCount.count || 0) + (publicSnippetsCount.count || 0)
      });

    } catch (error: any) {
      toast({
        title: "Error loading admin data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole as any
        });

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You need admin privileges to access this panel</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderator':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <span>Admin Panel</span>
          </h2>
          <p className="text-muted-foreground">Manage users and monitor platform activity</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Snippets</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSnippets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Content</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publicContent}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userData) => {
              const currentRole = userData.user_roles?.[0]?.role || 'user';
              
              return (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {userData.email?.split('@')[0]}
                      </h4>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(userData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getRoleBadgeColor(currentRole)}>
                      {currentRole}
                    </Badge>
                    
                    {userData.id !== user?.id && (
                      <Select
                        value={currentRole}
                        onValueChange={(newRole) => updateUserRole(userData.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {userData.id === user?.id && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};