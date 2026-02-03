-- Add this to your Supabase SQL Editor

-- 1. Create Push Subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Function to trigger notifications on new tasks
CREATE OR REPLACE FUNCTION public.handle_task_notification()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
    payload JSONB;
BEGIN
    -- Only trigger for new tasks or status changes
    IF (TG_OP = 'INSERT') THEN
        -- Notify the assigned user
        target_user_id := NEW.assigned_to;
        IF target_user_id IS NOT NULL THEN
            payload := jsonb_build_object(
                'title', 'Nový úkol: ' || NEW.title,
                'body', COALESCE(NEW.description, 'Máš nový úkol k vyřešení!'),
                'url', '/dashboard'
            );
            PERFORM net.http_post(
                url := 'YOUR_SUPABASE_PROJECT_URL/functions/v1/send-push',
                headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'),
                body := jsonb_build_object('user_id', target_user_id, 'payload', payload)
            );
        END IF;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        -- If task is pending approval, notify parents
        IF (NEW.status = 'pending_approval') THEN
             -- Notify all parents in the same house
             FOR target_user_id IN (SELECT id FROM profiles WHERE house_id = NEW.house_id AND role = 'parent') LOOP
                payload := jsonb_build_object(
                    'title', 'Úkol ke schválení',
                    'body', NEW.title || ' byl dokončen a čeká na kontrolu.',
                    'url', '/dashboard'
                );
                PERFORM net.http_post(
                    url := 'YOUR_SUPABASE_PROJECT_URL/functions/v1/send-push',
                    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'),
                    body := jsonb_build_object('user_id', target_user_id, 'payload', payload)
                );
             END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tasks
DROP TRIGGER IF EXISTS on_task_change ON public.tasks;
CREATE TRIGGER on_task_change
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_task_notification();
