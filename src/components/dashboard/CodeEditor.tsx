import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Save, 
  Share2, 
  Plus, 
  Code, 
  Terminal, 
  Copy, 
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export const CodeEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    title: '',
    description: '',
    is_public: false
  });

  const languages = [
    { value: 'javascript', label: 'JavaScript', example: 'console.log("Hello, World!");' },
    { value: 'python', label: 'Python', example: 'print("Hello, World!")' },
    { value: 'java', label: 'Java', example: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { value: 'cpp', label: 'C++', example: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { value: 'csharp', label: 'C#', example: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
    { value: 'python3', label: 'Python 3', example: 'print("Hello, World!")' },
    { value: 'php', label: 'PHP', example: '<?php\necho "Hello, World!";\n?>' },
    { value: 'ruby', label: 'Ruby', example: 'puts "Hello, World!"' },
    { value: 'go', label: 'Go', example: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
    { value: 'rust', label: 'Rust', example: 'fn main() {\n    println!("Hello, World!");\n}' }
  ];

  useEffect(() => {
    fetchSnippets();
    // Set default code example
    const defaultLang = languages.find(lang => lang.value === currentLanguage);
    if (defaultLang && !currentCode) {
      setCurrentCode(defaultLang.example);
    }
  }, [user]);

  const fetchSnippets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSnippets(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading snippets",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    const langData = languages.find(lang => lang.value === language);
    if (langData && !currentCode.trim()) {
      setCurrentCode(langData.example);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // For now, we'll simulate code execution
      // In a real implementation, you'd call a code execution API like Judge0
      
      if (currentLanguage === 'javascript') {
        // Simple JavaScript evaluation (not secure for production)
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
          };

          // Create a safe environment
          const result = eval(currentCode);
          console.log = originalLog;

          setOutput(logs.join('\n') || (result !== undefined ? String(result) : 'Code executed successfully'));
        } catch (error: any) {
          setOutput(`Error: ${error.message}`);
        }
      } else {
        // For other languages, show a simulation message
        setOutput(`Code execution simulation for ${currentLanguage}:\n\nYour code would run here in a real environment.\nThis is a demo of the code execution feature.\n\nCode:\n${currentCode}`);
      }

      toast({
        title: "Code executed",
        description: "Check the output below"
      });

    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Execution failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('code_snippets')
        .insert({
          title: saveFormData.title,
          description: saveFormData.description,
          code: currentCode,
          language: currentLanguage,
          is_public: saveFormData.is_public,
          user_id: user.id
        });

      if (error) throw error;
      
      toast({
        title: "Snippet saved",
        description: "Your code snippet has been saved successfully"
      });
      
      setIsSaveDialogOpen(false);
      setSaveFormData({ title: '', description: '', is_public: false });
      fetchSnippets();
    } catch (error: any) {
      toast({
        title: "Error saving snippet",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLoadSnippet = (snippet: CodeSnippet) => {
    setCurrentCode(snippet.code);
    setCurrentLanguage(snippet.language);
    setOutput('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    toast({
      title: "Code copied",
      description: "Code has been copied to clipboard"
    });
  };

  const handleDownload = () => {
    const language = languages.find(lang => lang.value === currentLanguage);
    const extension = {
      javascript: 'js',
      python: 'py',
      python3: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs'
    }[currentLanguage] || 'txt';

    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: `Code downloaded as code.${extension}`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Code Practice</h2>
          <p className="text-muted-foreground">Write, run, and save your code snippets</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Code Snippet</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveSnippet} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={saveFormData.title}
                    onChange={(e) => setSaveFormData({ ...saveFormData, title: e.target.value })}
                    placeholder="Enter snippet title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={saveFormData.description}
                    onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
                    placeholder="Describe your code snippet"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={saveFormData.is_public}
                    onCheckedChange={(checked) => setSaveFormData({ ...saveFormData, is_public: checked })}
                  />
                  <Label htmlFor="is_public">Make public</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
                    Save Snippet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCopyCode} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Code Editor</span>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-40">
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
                  <Button 
                    onClick={handleRunCode} 
                    disabled={isRunning}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                placeholder="Write your code here..."
                className="min-h-[400px] font-mono text-sm resize-none"
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Output</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm min-h-[200px] overflow-auto">
                {output || 'Output will appear here after running your code...'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Snippets */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Snippets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snippets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No saved snippets yet</p>
              ) : (
                snippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleLoadSnippet(snippet)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{snippet.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {snippet.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            {snippet.language}
                          </span>
                          {snippet.is_public ? (
                            <Eye className="h-3 w-3 text-green-500" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};