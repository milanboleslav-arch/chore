"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkEmail, setCheckEmail] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: `${window.location.origin}/house/setup`,
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
                    <p className="text-slate-400">Začněte spravovat svůj dům hned teď</p>
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

                        <Button type="submit" className="w-full" loading={loading}>
                            Zaregistrovat se
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
