-- Add enhanced features for the programming learning platform

-- Create courses table for learning paths
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'data-science', 'web-dev', 'mobile-dev', etc.
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  language TEXT, -- programming language if specific
  content JSONB, -- structured course content
  prerequisites TEXT[],
  estimated_hours INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lesson_order INTEGER NOT NULL,
  lesson_type TEXT DEFAULT 'text', -- 'text', 'video', 'code', 'quiz'
  code_examples JSONB,
  exercises JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create follows table for social features
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Add likes to code snippets and notes
CREATE TABLE public.content_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'code_snippet', 'note', 'task'
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Add code execution results table
CREATE TABLE public.code_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  input_data TEXT,
  output TEXT,
  error_message TEXT,
  execution_time_ms INTEGER,
  memory_used_kb INTEGER,
  status TEXT NOT NULL, -- 'success', 'error', 'timeout'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add challenges table
CREATE TABLE public.programming_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  language TEXT,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB,
  points INTEGER DEFAULT 0,
  category TEXT,
  created_by UUID,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add challenge submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.programming_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL, -- 'passed', 'failed', 'pending'
  score INTEGER DEFAULT 0,
  test_results JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programming_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Course creators can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for course lessons
CREATE POLICY "Anyone can view lessons of published courses" ON public.course_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true)
);
CREATE POLICY "Admins can manage all lessons" ON public.course_lessons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Course creators can manage lessons" ON public.course_lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND created_by = auth.uid())
);

-- RLS Policies for user progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.user_progress FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for study groups
CREATE POLICY "Anyone can view public groups" ON public.study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Group creators can manage own groups" ON public.study_groups FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all groups" ON public.study_groups FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for group members
CREATE POLICY "Group members can view group membership" ON public.group_members FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_members.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can join/leave groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Group admins can manage members" ON public.group_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND created_by = auth.uid())
);

-- RLS Policies for follows
CREATE POLICY "Users can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for content likes
CREATE POLICY "Users can view likes" ON public.content_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.content_likes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for code executions
CREATE POLICY "Users can view own executions" ON public.code_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create executions" ON public.code_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all executions" ON public.code_executions FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for challenges
CREATE POLICY "Anyone can view published challenges" ON public.programming_challenges FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all challenges" ON public.programming_challenges FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Challenge creators can manage own challenges" ON public.programming_challenges FOR ALL USING (auth.uid() = created_by);

-- RLS Policies for challenge submissions
CREATE POLICY "Users can view own submissions" ON public.challenge_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Challenge creators can view submissions" ON public.challenge_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.programming_challenges WHERE id = challenge_id AND created_by = auth.uid())
);
CREATE POLICY "Admins can view all submissions" ON public.challenge_submissions FOR SELECT USING (is_admin(auth.uid()));

-- Add triggers for updated_at columns
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programming_challenges_updated_at BEFORE UPDATE ON public.programming_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses for different career paths
INSERT INTO public.courses (title, description, category, difficulty_level, language, content, estimated_hours, is_published) VALUES
('Complete Data Analyst Bootcamp', 'Learn data analysis from scratch with Python, SQL, and visualization tools', 'data-science', 'beginner', 'python', '{"modules": ["Python Basics", "Data Manipulation with Pandas", "SQL for Data Analysis", "Data Visualization", "Statistical Analysis", "Real-world Projects"]}', 120, true),
('Web Development Mastery', 'Full-stack web development with modern technologies', 'web-dev', 'beginner', 'javascript', '{"modules": ["HTML/CSS Fundamentals", "JavaScript ES6+", "React.js", "Node.js", "Database Design", "Deployment"]}', 150, true),
('Mobile App Development', 'Build mobile apps for iOS and Android', 'mobile-dev', 'intermediate', 'javascript', '{"modules": ["React Native Basics", "Navigation", "State Management", "API Integration", "Publishing Apps"]}', 100, true),
('Machine Learning Engineer Path', 'Advanced ML and AI development', 'ai-ml', 'advanced', 'python', '{"modules": ["ML Algorithms", "Deep Learning", "Neural Networks", "Computer Vision", "NLP", "MLOps"]}', 200, true),
('DevOps Engineer Track', 'Infrastructure, automation, and deployment', 'devops', 'intermediate', 'bash', '{"modules": ["Linux Administration", "Docker", "Kubernetes", "CI/CD", "Cloud Platforms", "Monitoring"]}', 130, true);

-- Insert sample programming challenges
INSERT INTO public.programming_challenges (title, description, difficulty, language, starter_code, solution_code, test_cases, points, category, is_published) VALUES
('Two Sum Problem', 'Given an array of integers and a target sum, return indices of two numbers that add up to the target.', 'easy', 'python', 'def two_sum(nums, target):\n    # Your code here\n    pass', 'def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []', '{"test_cases": [{"input": {"nums": [2,7,11,15], "target": 9}, "expected": [0,1]}, {"input": {"nums": [3,2,4], "target": 6}, "expected": [1,2]}]}', 100, 'algorithms', true),
('Fibonacci Sequence', 'Write a function to generate the nth Fibonacci number.', 'easy', 'javascript', 'function fibonacci(n) {\n    // Your code here\n}', 'function fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}', '{"test_cases": [{"input": {"n": 5}, "expected": 5}, {"input": {"n": 10}, "expected": 55}]}', 100, 'algorithms', true),
('Binary Search', 'Implement binary search algorithm to find target in sorted array.', 'medium', 'python', 'def binary_search(arr, target):\n    # Your code here\n    pass', 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1', '{"test_cases": [{"input": {"arr": [1,3,5,7,9], "target": 5}, "expected": 2}, {"input": {"arr": [1,2,3,4,5], "target": 6}, "expected": -1}]}', 200, 'algorithms', true);