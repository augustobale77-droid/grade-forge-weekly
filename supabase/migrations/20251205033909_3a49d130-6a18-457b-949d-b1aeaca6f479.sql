-- Study Manager Database Schema

-- Create enum types
CREATE TYPE difficulty_level AS ENUM ('Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil');
CREATE TYPE weight_level AS ENUM ('Baixa', 'Média', 'Alta');
CREATE TYPE cycle_status AS ENUM ('active', 'paused', 'completed');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weekly_hours DECIMAL(5,2) NULL,
  ask_hours BOOLEAN DEFAULT true,
  current_cycle_id UUID NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study cycles table
CREATE TABLE public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) DEFAULT 'Ciclo atual',
  weekly_hours DECIMAL(5,2) NOT NULL,
  status cycle_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects (materias) table
CREATE TABLE public.materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  difficulty difficulty_level NOT NULL,
  weight weight_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cycle subjects (hours assigned per subject in a cycle)
CREATE TABLE public.cycle_materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  hours_assigned DECIMAL(5,2) NOT NULL,
  hours_completed DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cycle_id, materia_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_materias ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cycles
CREATE POLICY "Users can view their own cycles" ON public.cycles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cycles" ON public.cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cycles" ON public.cycles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cycles" ON public.cycles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for materias
CREATE POLICY "Users can view their own subjects" ON public.materias
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subjects" ON public.materias
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subjects" ON public.materias
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" ON public.materias
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cycle_materias
CREATE POLICY "Users can view their cycle subjects" ON public.cycle_materias
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cycles WHERE cycles.id = cycle_materias.cycle_id AND cycles.user_id = auth.uid())
  );
CREATE POLICY "Users can create their cycle subjects" ON public.cycle_materias
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cycles WHERE cycles.id = cycle_materias.cycle_id AND cycles.user_id = auth.uid())
  );
CREATE POLICY "Users can update their cycle subjects" ON public.cycle_materias
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cycles WHERE cycles.id = cycle_materias.cycle_id AND cycles.user_id = auth.uid())
  );
CREATE POLICY "Users can delete their cycle subjects" ON public.cycle_materias
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cycles WHERE cycles.id = cycle_materias.cycle_id AND cycles.user_id = auth.uid())
  );

-- Trigger to create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'), NEW.email);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_cycles_user_id ON public.cycles(user_id);
CREATE INDEX idx_materias_user_id ON public.materias(user_id);
CREATE INDEX idx_cycle_materias_cycle_id ON public.cycle_materias(cycle_id);
CREATE INDEX idx_cycle_materias_materia_id ON public.cycle_materias(materia_id);