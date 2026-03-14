BEGIN;

-- Create daily_tasks table for route planning
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    collector_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_id uuid REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
    task_date date NOT NULL DEFAULT CURRENT_DATE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(collector_id, loan_id, task_date)
);

-- RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so this script is safe to re-run
DROP POLICY IF EXISTS "Admins have full access to daily_tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Collectors can manage their own tasks" ON public.daily_tasks;

-- Admins can do everything
CREATE POLICY "Admins have full access to daily_tasks"
ON public.daily_tasks FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Collectors can read, insert, and update their own tasks
CREATE POLICY "Collectors can manage their own tasks"
ON public.daily_tasks FOR ALL
TO authenticated
USING (collector_id = auth.uid())
WITH CHECK (collector_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_daily_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_tasks_updated_at ON public.daily_tasks;

CREATE TRIGGER trg_daily_tasks_updated_at
BEFORE UPDATE ON public.daily_tasks
FOR EACH ROW
EXECUTE FUNCTION update_daily_tasks_updated_at();

COMMIT;
