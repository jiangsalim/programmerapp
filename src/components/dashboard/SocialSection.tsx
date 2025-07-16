import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Heart, MessageSquare, Share2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  tags: string[];
  member_count?: number;
  is_member?: boolean;
}

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  is_public: boolean;
  likes_count: number;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
  is_liked?: boolean;
}

export const SocialSection = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    tags: "",
    max_members: 20
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudyGroups();
    fetchCodeSnippets();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("study_groups")
        .select(`
          *,
          group_members(user_id)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const groupsWithMembers = data?.map(group => ({
        ...group,
        member_count: group.group_members?.length || 0,
        is_member: user ? group.group_members?.some((m: any) => m.user_id === user.id) : false
      })) || [];

      setStudyGroups(groupsWithMembers);
    } catch (error) {
      console.error("Error fetching study groups:", error);
      toast({
        title: "Error",
        description: "Failed to load study groups",
        variant: "destructive",
      });
    }
  };

  const fetchCodeSnippets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("code_snippets")
        .select(`
          id,
          title,
          description,
          code,
          language,
          is_public,
          likes_count,
          user_id,
          created_at,
          profiles!inner(username, full_name)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch likes separately for current user
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from("content_likes")
          .select("content_id")
          .eq("user_id", user.id)
          .eq("content_type", "code_snippet");
        
        userLikes = likesData?.map(like => like.content_id) || [];
      }

      const snippetsWithLikes = (data as any)?.map((snippet: any) => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description || "",
        code: snippet.code,
        language: snippet.language,
        is_public: snippet.is_public,
        likes_count: snippet.likes_count || 0,
        user_id: snippet.user_id,
        created_at: snippet.created_at,
        profiles: snippet.profiles,
        is_liked: userLikes.includes(snippet.id)
      })) || [];

      setCodeSnippets(snippetsWithLikes);
    } catch (error) {
      console.error("Error fetching code snippets:", error);
      toast({
        title: "Error",
        description: "Failed to load code snippets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const tags = newGroup.tags.split(",").map(tag => tag.trim()).filter(Boolean);

      const { data, error } = await supabase
        .from("study_groups")
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          created_by: user.id,
          is_public: true,
          max_members: newGroup.max_members,
          tags
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from("group_members")
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: "admin"
        });

      toast({
        title: "Success",
        description: "Study group created successfully!",
      });

      setNewGroup({ name: "", description: "", tags: "", max_members: 20 });
      fetchStudyGroups();
    } catch (error) {
      console.error("Error creating study group:", error);
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: "member"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined study group successfully!",
      });

      fetchStudyGroups();
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join study group",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (snippetId: string, isLiked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        // Remove like
        await supabase
          .from("content_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("content_type", "code_snippet")
          .eq("content_id", snippetId);

        // Update likes count manually
        setCodeSnippets(prev => prev.map(snippet => 
          snippet.id === snippetId 
            ? { ...snippet, likes_count: Math.max(0, snippet.likes_count - 1), is_liked: false }
            : snippet
        ));
      } else {
        // Add like
        await supabase
          .from("content_likes")
          .insert({
            user_id: user.id,
            content_type: "code_snippet",
            content_id: snippetId
          });

        // Update likes count manually
        setCodeSnippets(prev => prev.map(snippet => 
          snippet.id === snippetId 
            ? { ...snippet, likes_count: snippet.likes_count + 1, is_liked: true }
            : snippet
        ));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const filteredGroups = studyGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Community</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Community</h2>
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  />
                  <Textarea
                    placeholder="Group description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newGroup.tags}
                    onChange={(e) => setNewGroup({...newGroup, tags: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Max members"
                    value={newGroup.max_members}
                    onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value) || 20})}
                  />
                  <Button onClick={createStudyGroup} className="w-full">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {group.name}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {group.member_count}/{group.max_members}
                    </div>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {group.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button 
                    onClick={() => joinGroup(group.id)}
                    disabled={group.is_member || group.member_count >= group.max_members}
                    className="w-full"
                    variant={group.is_member ? "secondary" : "default"}
                  >
                    {group.is_member ? "Already Member" : 
                     group.member_count >= group.max_members ? "Group Full" : 
                     "Join Group"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="snippets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {codeSnippets.map((snippet) => (
              <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{snippet.title}</CardTitle>
                  <CardDescription>{snippet.description}</CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {snippet.profiles?.username || snippet.profiles?.full_name || 'Anonymous'}</span>
                    <Badge variant="outline">{snippet.language}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-32">
                    <code>{snippet.code}</code>
                  </pre>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(snippet.id, snippet.is_liked || false)}
                      className={`flex items-center gap-1 ${snippet.is_liked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${snippet.is_liked ? 'fill-current' : ''}`} />
                      {snippet.likes_count}
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};