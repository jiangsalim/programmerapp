import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Code, Trophy, Globe, BookOpen, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "5M+",
    label: "Active Learners",
    description: "Join millions learning to code",
    color: "text-blue-400"
  },
  {
    icon: Code,
    value: "15+",
    label: "Programming Languages",
    description: "From JavaScript to Python",
    color: "text-green-400"
  },
  {
    icon: BookOpen,
    value: "500+",
    label: "Interactive Lessons",
    description: "Hands-on coding experience",
    color: "text-purple-400"
  },
  {
    icon: Trophy,
    value: "1M+",
    label: "Certificates Earned",
    description: "Validate your skills",
    color: "text-yellow-400"
  },
  {
    icon: Star,
    value: "4.8/5",
    label: "Average Rating",
    description: "Loved by our community",
    color: "text-orange-400"
  },
  {
    icon: Globe,
    value: "150+",
    label: "Countries",
    description: "Global learning community",
    color: "text-cyan-400"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="px-4 py-2">
            📊 Platform Statistics
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Trusted by Millions
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a global community of learners and developers who have chosen our platform to advance their careers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-background/50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-full border border-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Over <span className="text-primary font-bold">10,000</span> courses completed daily
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};