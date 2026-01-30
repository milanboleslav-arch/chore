"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [checkEmail, setCheckEmail] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const invitedHouseId = searchParams.get("house_id");
    const invitedRole = searchParams.get("role");

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push("/dashboard");
        };
        checkSession();
    }, [supabase, router]);

    const handleSocialLogin = async (provider: 'google') => {
        setSocialLoading(provider);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setSocialLoading(null);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Build redirect URL with pending house info
        const redirectUrl = new URL(`${window.location.origin}/house/setup`);
        if (invitedHouseId) redirectUrl.searchParams.set("house_id", invitedHouseId);
        if (invitedRole) redirectUrl.searchParams.set("role", invitedRole);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: redirectUrl.toString(),
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        setCheckEmail(true);
        setLoading(false);
    };

    if (checkEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <Card className="max-w-md w-full p-8 text-center bg-[#161b22] border-violet-500/30">
                    <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-400">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold font-outfit mb-4">Zkontrolujte e-mail</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Na adresu <span className="text-white font-bold">{email}</span> jsme odeslali potvrzovací odkaz.
                        Klikněte na něj pro aktivaci účtu.
                    </p>
                    {typeof window !== "undefined" && window.location.hostname === "localhost" && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 text-left">
                            <p className="font-bold mb-1">Důležité upozornění:</p>
                            Pokud tento e-mail otevřete na mobilu, potvrzovací odkaz nebude fungovat (protože odkazuje na <code>localhost</code>). Pro testování na mobilu se musíte registrovat přes IP adresu vašeho počítače.
                        </div>
                    )}
                    <Button onClick={() => router.push("/login")} variant="outline" className="w-full border-white/10">
                        Přejít na přihlášení
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Gamepad2 className="text-white w-7 h-7" />
                        </div>
                        <span className="text-3xl font-bold font-outfit uppercase tracking-tighter">Chore</span>
                    </Link>
                    <h1 className="text-3xl font-bold font-outfit mb-2">Vytvořte si účet</h1>
                    {invitedHouseId ? (
                        <p className="text-violet-400 font-bold">Chystáte se připojit k rodině</p>
                    ) : (
                        <p className="text-slate-400">Začněte spravovat svůj dům hned teď</p>
                    )}
                </div>

                <Card className="p-8">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm italic">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Jméno</label>
                            <div className="relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="např. Jan Novák"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="vas@email.cz"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Heslo</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12" loading={loading}>
                            Zaregistrovat se
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#12161f] px-2 text-slate-500 font-bold tracking-widest">Nebo přes</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-white/10 hover:bg-white/5 gap-2"
                            onClick={() => handleSocialLogin('google')}
                            loading={socialLoading === 'google'}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Zaregistrovat se přes Google
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-slate-400 text-sm">
                        Již máte účet?{" "}
                        <Link href="/login" className="text-violet-400 font-bold hover:underline">
                            Přihlaste se
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
