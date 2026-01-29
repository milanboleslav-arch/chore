"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Hesla se neshodují.");
            setLoading(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            if (updateError.message.includes("New password should be different")) {
                setError("Nové heslo musí být jiné než to stávající. Pokud toto heslo znáte, zkuste se s ním prosím přihlásit.");
            } else {
                setError(updateError.message);
            }
        } else {
            setMessage("Heslo bylo úspěšně změněno. Přesměrovávám vás na přihlášení...");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
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
                    <h1 className="text-3xl font-bold font-outfit mb-2">Nové heslo</h1>
                    <p className="text-slate-400">Zadejte své nové tajné heslo</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
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
                            <label className="text-sm font-medium text-slate-300 ml-1">Nové heslo</label>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Potvrďte nové heslo</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" variant="secondary" className="w-full h-14" loading={loading}>
                            Uložit heslo
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
