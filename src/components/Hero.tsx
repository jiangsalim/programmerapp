import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Code, Users, Trophy } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                🚀 Learn to Code Today
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Master Programming
                <span className="block bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                  One Lesson at a Time
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Join millions of learners on their coding journey. Interactive lessons, 
                real-world projects, and a supportive community await you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-lg px-8 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Learning
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Code className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5M+</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Learners
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  Languages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Completed
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-card to-muted rounded-3xl p-8 shadow-2xl border border-border/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-muted-foreground">lesson.js</div>
                </div>
                <div className="bg-background/50 rounded-lg p-6 space-y-2 font-mono text-sm">
                  <div className="text-muted-foreground">// Your first JavaScript lesson</div>
                  <div className="text-javascript">console.log(<span className="text-green-400">"Hello, World!"</span>);</div>
                  <div className="text-muted-foreground">// Output: Hello, World!</div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow"
                  size="lg"
                >
                  Run Code
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};