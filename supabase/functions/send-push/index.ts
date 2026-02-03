import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webPush from "https://esm.sh/web-push"

serve(async (req) => {
    try {
        const { user_id, payload } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', user_id)

        if (error || !subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: 'No subscriptions found for user' }), { status: 200 })
        }

        webPush.setVapidDetails(
            Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@boleslav.netlify.app',
            Deno.env.get('VAPID_PUBLIC_KEY')!,
            Deno.env.get('VAPID_PRIVATE_KEY')!
        )

        const sendPromises = subscriptions.map((sub: any) =>
            webPush.sendNotification(sub.subscription, JSON.stringify(payload))
                .catch(err => {
                    console.error('Error sending push:', err)
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired or gone, should delete from DB
                        // (Ideally we'd handle this, but let's keep it simple for now)
                    }
                })
        )

        await Promise.all(sendPromises)

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
