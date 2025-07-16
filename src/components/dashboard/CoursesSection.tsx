import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, Users, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  language: string;
  estimated_hours: number;
  content: any;
}

interface UserProgress {
  course_id: string;
  progress_percentage: number;
  completed: boolean;
}

export const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Courses" },
    { value: "data-science", label: "Data Science" },
    { value: "web-dev", label: "Web Development" },
    { value: "mobile-dev", label: "Mobile Development" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "devops", label: "DevOps" }
  ];

  const difficultyColors = {
    beginner: "bg-green-500",
    intermediate: "bg-yellow-500",
    advanced: "bg-red-500"
  };

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
      setCourses(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("course_id, progress_percentage, completed")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already enrolled
      const { data: existing } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

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

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getUserProgress = (courseId: string) => {
    return userProgress.find(p => p.course_id === courseId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Learning Paths</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Learning Paths</h2>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.value)}
            size="sm"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const progress = getUserProgress(course.id);
          const isEnrolled = !!progress;

          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${difficultyColors[course.difficulty_level as keyof typeof difficultyColors]} text-white`}
                  >
                    {course.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.estimated_hours}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.language}
                  </div>
                </div>

                {/* Course Modules */}
                {course.content?.modules && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">What you'll learn:</h4>
                    <div className="space-y-1">
                      {course.content.modules.slice(0, 3).map((module: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-3 w-3" />
                          {module}
                        </div>
                      ))}
                      {course.content.modules.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{course.content.modules.length - 3} more modules
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar for Enrolled Courses */}
                {isEnrolled && progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.progress_percentage}%</span>
                    </div>
                    <Progress value={progress.progress_percentage} className="h-2" />
                  </div>
                )}

                <Button 
                  onClick={() => enrollInCourse(course.id)}
                  disabled={isEnrolled}
                  className="w-full"
                  variant={isEnrolled ? "secondary" : "default"}
                >
                  {isEnrolled ? "Continue Learning" : "Start Course"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {selectedCategory === "all" 
              ? "No courses available at the moment" 
              : `No courses found in the ${categories.find(c => c.value === selectedCategory)?.label} category`
            }
          </p>
        </div>
      )}
    </div>
  );
};