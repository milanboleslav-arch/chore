"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient, getSiteUrl } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const siteUrl = getSiteUrl();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            setMessage("Instrukce pro obnovu hesla byly odeslány na váš email.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Gamepad2 className="text-white w-7 h-7" />
                        </div>
                        <span className="text-3xl font-bold font-outfit uppercase tracking-tighter">Chore</span>
                    </Link>
                    <h1 className="text-3xl font-bold font-outfit mb-2">Zapomenuté heslo</h1>
                    <p className="text-slate-400">Zadejte svůj email a my vám pošleme link na obnovu</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleResetRequest} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm italic text-center">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm italic text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="vas@email.cz"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" variant="secondary" className="w-full h-14" loading={loading}>
                            Odeslat instrukce
                        </Button>
                    </form>

                    <Link href="/login" className="flex items-center justify-center gap-2 mt-8 text-slate-400 text-sm hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Zpět na přihlášení
                    </Link>
                </Card>
            </div>
        </div>
    );
}
