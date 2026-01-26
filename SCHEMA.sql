-- 1. Create Houses table
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Profiles table (linked to Auth.Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT DEFAULT 'child', -- 'parent' or 'child'
  house_id UUID REFERENCES houses(id),
  points INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES houses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 10,
  punishment_desc TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'todo', -- 'todo', 'pending_approval', 'done', 'failed'
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  requires_proof BOOLEAN DEFAULT FALSE,
  proof_url TEXT,
  notify_all_parents BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for Houses
CREATE POLICY "Anyone can see house name if they have ID" 
  ON houses FOR SELECT 
  USING (true);

-- Policies for Profiles
CREATE POLICY "Users can see own profile or house members" 
  ON profiles FOR SELECT 
  USING (
    id = auth.uid() OR 
    house_id = (SELECT house_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (id = auth.uid());

-- Policies for Tasks
CREATE POLICY "Users can see tasks in their house" 
  ON tasks FOR SELECT 
  USING (
    house_id = (SELECT house_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Parents can manage tasks" 
  ON tasks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- Function to handle new user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
