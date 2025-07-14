import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Star, Play } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  color: string;
  icon: string;
  lessons: number;
  duration: string;
  level: string;
  progress: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="group h-full bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-3xl">{course.icon}</div>
          <div className="flex gap-2">
            {course.isNew && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                New
              </Badge>
            )}
            {course.isPopular && (
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <CardTitle className="group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {course.description}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={getLevelColor(course.level)}
          >
            {course.level}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {course.language}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.lessons} lessons
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </div>
        </div>

        {course.progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group/btn bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
        >
          <Play className="h-4 w-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
          {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
        </Button>
      </CardFooter>
    </Card>
  );
};