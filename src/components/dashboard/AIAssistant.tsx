import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Code, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const conversationsWithMessages = (data || []).map(conv => ({
        ...conv,
        messages: (conv.messages as any) || []
      }));
      
      setConversations(conversationsWithMessages);
      
      if (conversationsWithMessages.length > 0 && !currentConversation) {
        loadConversation(conversationsWithMessages[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading conversations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages || []);
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          messages: []
        })
        .select()
        .single();

      if (error) throw error;
      
      const newConv: Conversation = {
        ...data,
        messages: []
      };
      
      setConversations([newConv, ...conversations]);
      loadConversation(newConv);
      
      toast({
        title: "New conversation created",
        description: "Start chatting with the AI assistant"
      });
    } catch (error: any) {
      toast({
        title: "Error creating conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      
      if (currentConversation?.id === conversationId) {
        if (updatedConversations.length > 0) {
          loadConversation(updatedConversations[0]);
        } else {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simulate AI response (in production, you'd call your AI API)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, aiResponse];
      setMessages(updatedMessages);

      // Update conversation in database
      if (currentConversation) {
        const { error } = await supabase
          .from('ai_conversations')
          .update({
            messages: updatedMessages as any,
            title: updatedMessages.length === 2 ? generateTitle(userMessage.content) : currentConversation.title
          })
          .eq('id', currentConversation.id);

        if (error) throw error;
        
        // Update local conversation
        const updatedConversation = {
          ...currentConversation,
          messages: updatedMessages,
          title: updatedMessages.length === 2 ? generateTitle(userMessage.content) : currentConversation.title
        };
        setCurrentConversation(updatedConversation);
        
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversation.id ? updatedConversation : conv
          )
        );
      }

    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('error') || input.includes('bug')) {
      return `I'd be happy to help you debug this issue! To better assist you, could you please:

1. Share the specific error message you're seeing
2. Show me the code that's causing the problem
3. Describe what you expected to happen vs. what actually happened

Common debugging steps:
- Check for syntax errors (missing semicolons, brackets, etc.)
- Verify variable names and function calls
- Look at the browser console for detailed error messages
- Test with simplified code to isolate the issue

What specific error are you encountering?`;
    }
    
    if (input.includes('javascript') || input.includes('js')) {
      return `Great! JavaScript is a powerful language. Here are some key concepts and best practices:

**Core Concepts:**
- Variables: \`let\`, \`const\`, \`var\`
- Functions: Arrow functions, function declarations
- Objects and Arrays
- Promises and async/await
- DOM manipulation

**Best Practices:**
- Use \`const\` for variables that won't be reassigned
- Use meaningful variable names
- Handle errors with try/catch blocks
- Use modern ES6+ features

What specific JavaScript topic would you like to explore?`;
    }
    
    if (input.includes('python')) {
      return `Python is an excellent language for beginners and experts alike! Here's what makes it special:

**Key Features:**
- Clean, readable syntax
- Extensive standard library
- Great for data science, web development, automation
- Strong community and ecosystem

**Getting Started:**
\`\`\`python
# Variables and basic operations
name = "Python"
version = 3.11
print(f"Learning {name} {version}")

# Lists and loops
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)
\`\`\`

What Python concept would you like to learn about?`;
    }
    
    if (input.includes('react')) {
      return `React is a fantastic library for building user interfaces! Here are the essentials:

**Core Concepts:**
- Components (functional and class-based)
- JSX syntax
- Props and State
- Hooks (useState, useEffect, etc.)
- Event handling

**Example Component:**
\`\`\`jsx
function Welcome({ name }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}
\`\`\`

What React topic interests you most?`;
    }
    
    if (input.includes('algorithm') || input.includes('data structure')) {
      return `Algorithms and data structures are fundamental to programming! Here's a quick overview:

**Essential Data Structures:**
- Arrays and Lists
- Stacks and Queues
- Hash Tables/Maps
- Trees and Graphs
- Linked Lists

**Important Algorithms:**
- Sorting (QuickSort, MergeSort)
- Searching (Binary Search)
- Graph traversal (BFS, DFS)
- Dynamic Programming

**Problem-Solving Tips:**
1. Understand the problem clearly
2. Think about edge cases
3. Start with a brute force solution
4. Optimize step by step
5. Test with different inputs

Which topic would you like to dive deeper into?`;
    }
    
    // Default response
    return `I'm here to help you with your programming questions! I can assist with:

🚀 **Programming Languages**: JavaScript, Python, Java, C++, and more
🔧 **Debugging**: Finding and fixing errors in your code
📚 **Concepts**: Algorithms, data structures, design patterns
🎯 **Best Practices**: Code quality, performance optimization
🌐 **Web Development**: Frontend, backend, databases

Feel free to:
- Ask about specific errors you're encountering
- Share code you'd like me to review
- Request explanations of programming concepts
- Get help with project planning

What programming challenge can I help you with today?`;
  };

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button onClick={createNewConversation} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        currentConversation?.id === conv.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => loadConversation(conv)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{conv.title || 'New Conversation'}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Programming Assistant</span>
              <Badge variant="secondary">Beta</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!currentConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
                  <p className="text-muted-foreground mb-4">
                    Get help with coding problems, debugging, and learning new concepts
                  </p>
                  <Button onClick={createNewConversation} className="bg-gradient-to-r from-primary to-primary-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Ask me anything about programming! I'm here to help.
                        </p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.role === 'assistant' && (
                              <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <form onSubmit={sendMessage} className="flex space-x-2 mt-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your code, debugging, or programming concepts..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-primary to-primary-glow"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};