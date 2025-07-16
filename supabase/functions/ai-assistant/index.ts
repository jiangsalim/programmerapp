import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://omijwwvticrqbxqxqwnw.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWp3d3Z0aWNycWJ4cXhxd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDk3MDEsImV4cCI6MjA2ODA4NTcwMX0.9snSmNYWbi3D3uFbpmqqoECIHUfeFbV5UGuJwfmUoM0'
    );

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { message, conversationId, code, language } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`AI Assistant request from user ${user.id}: ${message.substring(0, 100)}...`);

    let systemPrompt = `You are CodeMaster AI, an expert programming tutor and code reviewer. You help students learn programming by:

1. Explaining concepts clearly and simply
2. Reviewing code and providing constructive feedback
3. Helping debug issues and errors
4. Suggesting best practices and improvements
5. Providing step-by-step guidance for learning

Always be encouraging, patient, and educational in your responses. Focus on helping the user understand WHY something works or doesn't work, not just WHAT to do.`;

    if (code && language) {
      systemPrompt += `\n\nThe user has provided ${language} code for review. Analyze it for:
- Syntax errors
- Logic issues
- Performance improvements
- Best practices
- Learning opportunities

Code to review:
\`\`\`${language}
${code}
\`\`\``;
    }

    // If we have OpenAI API key, use it; otherwise provide a mock response
    let response;
    if (openAIApiKey) {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Store or update conversation
      if (conversationId) {
        const { data: conversation } = await supabase
          .from('ai_conversations')
          .select('messages')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single();

        if (conversation) {
          const messages = conversation.messages as any[] || [];
          messages.push(
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
          );

          await supabase
            .from('ai_conversations')
            .update({ messages, updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      } else {
        // Create new conversation
        const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
        await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title,
            messages: [
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
            ]
          });
      }

      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Mock response when OpenAI API key is not available
      let mockResponse = `Hello! I'm CodeMaster AI. I'd love to help you with your programming questions! `;
      
      if (code && language) {
        mockResponse += `I can see you've shared some ${language} code. Here are some general tips for ${language} development:

1. **Code Structure**: Make sure your code is well-organized and readable
2. **Error Handling**: Always consider edge cases and potential errors
3. **Best Practices**: Follow ${language} conventions and style guidelines
4. **Testing**: Test your code with different inputs to ensure it works correctly

For specific code review, I would need the OpenAI API key to be configured to provide detailed analysis.`;
      } else {
        mockResponse += `Here are some ways I can help you:

🔍 **Code Review**: Share your code and I'll help you improve it
🐛 **Debugging**: Having issues? Let's figure out what's wrong together  
📚 **Learning**: Ask me about programming concepts, algorithms, or best practices
💡 **Problem Solving**: Stuck on a coding challenge? I can guide you through it

What would you like to work on today?`;
      }

      return new Response(JSON.stringify({ 
        response: mockResponse,
        note: "This is a demo response. Configure OpenAI API key for full AI capabilities."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process AI request',
      response: "I'm having trouble right now. Please try again later!" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});