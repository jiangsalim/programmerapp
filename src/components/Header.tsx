import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, User, Trophy, Book } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              CodeLearn
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Book className="h-4 w-4 mr-2" />
            Courses
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
        </nav>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex">
            Free Access
          </Badge>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};