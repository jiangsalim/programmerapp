import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const courses = [
  {
    id: "javascript-basics",
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language",
    language: "JavaScript",
    color: "javascript",
    icon: "📜",
    lessons: 45,
    duration: "6 hours",
    level: "Beginner",
    progress: 0,
    isNew: true
  },
  {
    id: "python-intro",
    title: "Python for Beginners",
    description: "Start your programming journey with Python",
    language: "Python",
    color: "python",
    icon: "🐍",
    lessons: 38,
    duration: "5 hours",
    level: "Beginner",
    progress: 0,
    isPopular: true
  },
  {
    id: "html-css",
    title: "HTML & CSS Essentials",
    description: "Build beautiful websites from scratch",
    language: "HTML/CSS",
    color: "html",
    icon: "🌐",
    lessons: 52,
    duration: "8 hours",
    level: "Beginner",
    progress: 0
  },
  {
    id: "java-fundamentals",
    title: "Java Programming",
    description: "Master object-oriented programming with Java",
    language: "Java",
    color: "java",
    icon: "☕",
    lessons: 65,
    duration: "12 hours",
    level: "Intermediate",
    progress: 0
  },
  {
    id: "cpp-basics",
    title: "C++ Fundamentals",
    description: "Learn system programming with C++",
    language: "C++",
    color: "cpp",
    icon: "⚡",
    lessons: 58,
    duration: "10 hours",
    level: "Intermediate",
    progress: 0
  },
  {
    id: "css-advanced",
    title: "Advanced CSS",
    description: "Master modern CSS layouts and animations",
    language: "CSS",
    color: "css",
    icon: "🎨",
    lessons: 42,
    duration: "7 hours",
    level: "Advanced",
    progress: 0
  }
];

export const FeaturedCourses = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Popular Programming
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Courses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our most popular programming languages and start your coding journey today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            View All Courses
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};