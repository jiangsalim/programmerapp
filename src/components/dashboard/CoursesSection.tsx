import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MoreVertical, Award, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  language: string;
  estimated_hours: number;
  content: any;
  icon?: string;
  color?: string;
}

interface UserProgress {
  course_id: string;
  progress_percentage: number;
  completed: boolean;
}

const predefinedCourses = [
  { title: "Introduction to HTML", icon: "HTML", color: "bg-orange-500", difficulty: "beginner", category: "web-dev", language: "HTML" },
  { title: "Introduction to CSS", icon: "CSS", color: "bg-blue-500", difficulty: "beginner", category: "web-dev", language: "CSS" },
  { title: "Introduction to Java", icon: "Java", color: "bg-orange-600", difficulty: "beginner", category: "programming", language: "Java" },
  { title: "Introduction to JavaScript", icon: "JS", color: "bg-yellow-500", difficulty: "beginner", category: "web-dev", language: "JavaScript" },
  { title: "C# Intermediate", icon: "C#", color: "bg-purple-500", difficulty: "intermediate", category: "programming", language: "C#" },
  { title: "Introduction to C++", icon: "C++", color: "bg-blue-600", difficulty: "beginner", category: "programming", language: "C++" },
  { title: "Tech for Everyone", icon: "⚙️", color: "bg-purple-600", difficulty: "beginner", category: "general", language: "General" },
  { title: "Python Intermediate", icon: "🐍", color: "bg-blue-500", difficulty: "intermediate", category: "programming", language: "Python" },
  { title: "Java Intermediate", icon: "Java", color: "bg-orange-600", difficulty: "intermediate", category: "programming", language: "Java" },
  { title: "JavaScript Intermediate", icon: "JS", color: "bg-yellow-500", difficulty: "intermediate", category: "web-dev", language: "JavaScript" },
  { title: "C++ Intermediate", icon: "C++", color: "bg-blue-600", difficulty: "intermediate", category: "programming", language: "C++" },
  { title: "C Intermediate", icon: "C", color: "bg-blue-500", difficulty: "intermediate", category: "programming", language: "C" },
  { title: "SQL Intermediate", icon: "SQL", color: "bg-green-500", difficulty: "intermediate", category: "database", language: "SQL" },
  { title: "Angular", icon: "A", color: "bg-red-500", difficulty: "intermediate", category: "web-dev", language: "TypeScript" },
  { title: "Python Developer", icon: "🐍", color: "bg-blue-500", difficulty: "advanced", category: "data-science", language: "Python" },
  { title: "Coding for Data", icon: "⚛️", color: "bg-purple-500", difficulty: "intermediate", category: "data-science", language: "Python" },
  { title: "Front-end for Beginners", icon: "💻", color: "bg-pink-500", difficulty: "beginner", category: "web-dev", language: "HTML/CSS/JS" },
  { title: "Data Analytics with AI", icon: "📊", color: "bg-blue-600", difficulty: "advanced", category: "ai-ml", language: "Python" },
  { title: "AI in Data Analysis", icon: "📈", color: "bg-green-600", difficulty: "advanced", category: "ai-ml", language: "Python" },
  { title: "Ethical AI Foundations", icon: "⚖️", color: "bg-orange-500", difficulty: "intermediate", category: "ai-ml", language: "General" },
  { title: "Write with AI", icon: "✏️", color: "bg-orange-500", difficulty: "beginner", category: "ai-ml", language: "General" },
  { title: "AI-Powered A/B Testing", icon: "🧪", color: "bg-pink-600", difficulty: "intermediate", category: "ai-ml", language: "Python" },
  { title: "Prompt Engineering", icon: "AI", color: "bg-blue-500", difficulty: "intermediate", category: "ai-ml", language: "General" },
  { title: "Visualize Your Data", icon: "📊", color: "bg-pink-500", difficulty: "intermediate", category: "data-science", language: "Python" },
  { title: "Introduction to LLMs", icon: "🧠", color: "bg-green-500", difficulty: "intermediate", category: "ai-ml", language: "Python" },
  { title: "ML for Beginners", icon: "🔗", color: "bg-purple-500", difficulty: "beginner", category: "ai-ml", language: "Python" },
  { title: "Brainstorm with AI", icon: "💡", color: "bg-orange-500", difficulty: "beginner", category: "ai-ml", language: "General" },
  { title: "Think Creatively with AI", icon: "🎯", color: "bg-red-500", difficulty: "intermediate", category: "ai-ml", language: "General" },
  { title: "Project Planning with AI", icon: "📋", color: "bg-blue-600", difficulty: "intermediate", category: "ai-ml", language: "General" },
  { title: "Research with AI", icon: "🔍", color: "bg-orange-500", difficulty: "beginner", category: "ai-ml", language: "General" },
  { title: "Social Media Marketing with AI", icon: "👍", color: "bg-blue-500", difficulty: "intermediate", category: "marketing", language: "General" },
  { title: "SEO with AI", icon: "🔍", color: "bg-pink-600", difficulty: "intermediate", category: "marketing", language: "General" },
  { title: "Vibe Coding", icon: "</", color: "bg-pink-600", difficulty: "beginner", category: "programming", language: "General" }
];

export const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [selectedView, setSelectedView] = useState<"all" | "my">("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
    fetchUserProgress();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Merge database courses with predefined courses
      const dbCourses = data || [];
      const allCourses = [
        ...dbCourses,
        ...predefinedCourses.filter(pc => 
          !dbCourses.some(dc => dc.title === pc.title)
        ).map((pc, index) => ({
          id: `predefined-${index}`,
          title: pc.title,
          description: `Learn ${pc.title} from basics to advanced concepts`,
          category: pc.category,
          difficulty_level: pc.difficulty,
          language: pc.language,
          estimated_hours: pc.difficulty === 'beginner' ? 20 : pc.difficulty === 'intermediate' ? 35 : 50,
          content: { modules: [`Introduction to ${pc.language}`, "Practical Examples", "Advanced Concepts", "Final Project"] },
          icon: pc.icon,
          color: pc.color
        }))
      ];
      
      setCourses(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("course_id, progress_percentage, completed")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserProgress(data || []);
      
      // Get enrolled courses
      const enrolledIds = (data || []).map(p => p.course_id);
      const enrolled = courses.filter(c => enrolledIds.includes(c.id));
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      if (!user) return;

      // Check if already enrolled
      const existing = userProgress.find(p => p.course_id === courseId);
      if (existing) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course",
        });
        return;
      }

      const { error } = await supabase
        .from("user_progress")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          completed: false
        });

      if (error) throw error;

      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course",
      });

      fetchUserProgress();
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const getDifficultyDots = (difficulty: string) => {
    const count = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < count ? 'bg-white' : 'bg-white/30'
        }`}
      />
    ));
  };

  const getUserProgress = (courseId: string) => {
    return userProgress.find(p => p.course_id === courseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary px-4 py-6">
          <div className="flex items-center gap-3 text-white">
            <ArrowLeft className="h-6 w-6" />
            <h1 className="text-xl font-semibold">All courses</h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayedCourses = selectedView === "my" ? enrolledCourses : courses;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 py-6">
        <div className="flex items-center gap-3 text-white">
          <ArrowLeft className="h-6 w-6" />
          <h1 className="text-xl font-semibold">All courses</h1>
        </div>
      </div>

      {/* My Courses Section */}
      {enrolledCourses.length > 0 && selectedView === "all" && (
        <div className="px-4 py-6">
          <h2 className="text-muted-foreground text-sm font-medium mb-4">My Courses</h2>
          <div className="space-y-3">
            {enrolledCourses.slice(0, 2).map((course) => {
              const progress = getUserProgress(course.id);
              return (
                <Card key={course.id} className="bg-card border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${course.color || 'bg-green-500'}`}>
                        {course.icon || course.language?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                        <p className="text-muted-foreground text-sm">In progress</p>
                        {progress && (
                          <Progress value={progress.progress_percentage} className="h-1 mt-2" />
                        )}
                      </div>
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle View */}
      <div className="px-4 py-2">
        <div className="flex gap-4">
          <Button
            variant={selectedView === "all" ? "default" : "ghost"}
            onClick={() => setSelectedView("all")}
            className="text-sm"
          >
            More courses
          </Button>
          {enrolledCourses.length > 0 && (
            <Button
              variant={selectedView === "my" ? "default" : "ghost"}
              onClick={() => setSelectedView("my")}
              className="text-sm"
            >
              My Courses
            </Button>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="px-4 pb-24 space-y-0">
        {displayedCourses.map((course) => {
          const progress = getUserProgress(course.id);
          const isEnrolled = !!progress;

          return (
            <Card key={course.id} className="bg-card border-none rounded-none border-b border-border/50 last:border-b-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${course.color || 'bg-green-500'}`}>
                    {course.icon || course.language?.charAt(0) || 'C'}
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      {getDifficultyDots(course.difficulty_level)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    {isEnrolled && progress && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs text-muted-foreground">{progress.progress_percentage}%</span>
                        </div>
                        <Progress value={progress.progress_percentage} className="h-1" />
                      </div>
                    )}
                    {!isEnrolled && (
                      <Button
                        onClick={() => enrollInCourse(course.id)}
                        size="sm"
                        className="mt-2"
                      >
                        Start Course
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    {isEnrolled && progress?.completed && (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};