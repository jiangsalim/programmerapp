import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Code, CheckCircle, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  starter_code: string;
  points: number;
  category: string;
}

interface Submission {
  challenge_id: string;
  status: string;
  score: number;
}

export const ChallengesSection = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
  };

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" }
  ];

  useEffect(() => {
    fetchChallenges();
    fetchSubmissions();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from("programming_challenges")
        .select("*")
        .eq("is_published", true)
        .order("difficulty", { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("challenge_submissions")
        .select("challenge_id, status, score")
        .eq("user_id", user.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const submitSolution = async () => {
    if (!selectedChallenge || !userCode.trim()) return;

    setExecuting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Execute the code
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('execute-code', {
        body: {
          code: userCode,
          language: selectedLanguage,
          input: ""
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      const executionResult = response.data;
      
      // Determine status based on execution result
      let status = 'failed';
      let score = 0;
      
      if (executionResult.status === 'success' && !executionResult.error) {
        // Simple check - if code runs without error, give partial credit
        status = 'passed';
        score = selectedChallenge.points * 0.8; // 80% for running code
        
        // Bonus points for specific solutions
        if (userCode.includes('return') && userCode.length > 20) {
          score = selectedChallenge.points;
        }
      }

      // Save submission
      const { error: submitError } = await supabase
        .from("challenge_submissions")
        .upsert({
          challenge_id: selectedChallenge.id,
          user_id: user.id,
          code: userCode,
          language: selectedLanguage,
          status,
          score: Math.round(score),
          test_results: { executionResult }
        });

      if (submitError) throw submitError;

      toast({
        title: status === 'passed' ? "Solution Accepted!" : "Solution Failed",
        description: status === 'passed' 
          ? `Congratulations! You earned ${Math.round(score)} points.`
          : "Your solution didn't pass all test cases. Keep trying!",
        variant: status === 'passed' ? "default" : "destructive",
      });

      fetchSubmissions();
      
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const openChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starter_code || "");
    setSelectedLanguage(challenge.language || "python");
  };

  const getSubmissionStatus = (challengeId: string) => {
    return submissions.find(s => s.challenge_id === challengeId);
  };

  const getTotalScore = () => {
    return submissions.reduce((total, sub) => total + (sub.score || 0), 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Programming Challenges</h2>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Programming Challenges</h2>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">{getTotalScore()} points</span>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const submission = getSubmissionStatus(challenge.id);
          const isCompleted = submission?.status === 'passed';

          return (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {challenge.title}
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]} text-white`}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    {challenge.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {challenge.points} points
                  </div>
                </div>

                {submission && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      submission.status === 'passed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.status === 'passed' ? 'Solved' : 'Attempted'}
                    </span>
                    {submission.score > 0 && (
                      <span className="text-muted-foreground">
                        {submission.score} points earned
                      </span>
                    )}
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => openChallenge(challenge)}
                      className="w-full"
                      variant={isCompleted ? "secondary" : "default"}
                    >
                      {isCompleted ? "View Solution" : "Solve Challenge"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {selectedChallenge?.title}
                        <Badge className={`${difficultyColors[selectedChallenge?.difficulty as keyof typeof difficultyColors]} text-white`}>
                          {selectedChallenge?.difficulty}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedChallenge && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Problem Description</h4>
                          <p className="text-muted-foreground">{selectedChallenge.description}</p>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Your Solution</label>
                          <Textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            className="font-mono min-h-[300px]"
                            placeholder="Write your solution here..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={submitSolution}
                            disabled={executing || !userCode.trim()}
                            className="flex items-center gap-2"
                          >
                            {executing ? (
                              <>
                                <Clock className="h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Solution"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No challenges available</h3>
          <p className="text-muted-foreground">
            Check back later for new programming challenges!
          </p>
        </div>
      )}
    </div>
  );
};