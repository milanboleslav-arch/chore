"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Shield, User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function JoinHousePage() {
    const { id: houseId } = useParams();
    const searchParams = useSearchParams();
    const invitedRole = searchParams.get("role") as 'child' | 'parent' | null;

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [house, setHouse] = useState<{ name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            // Fetch House
            const { data: houseData, error: houseError } = await supabase
                .from("houses")
                .select("name")
                .eq("id", houseId)
                .single();

            if (houseError) {
                setError("Rodina nebyla nalezena. Zkontrolujte prosím odkaz.");
            } else {
                setHouse(houseData);
            }

            // Fetch Current User
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            setLoading(false);
        }
        fetchData();
    }, [houseId, supabase]);

    const handleJoin = useCallback(async (role: 'child' | 'parent') => {
        setJoining(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            localStorage.setItem("pending_house_id", houseId as string);
            localStorage.setItem("pending_role", role);
            router.push("/register");
            return;
        }

        // If user is already logged in, we update their profile
        const { error } = await supabase
            .from("profiles")
            .update({ house_id: houseId, role: role })
            .eq("id", user.id);

        if (error) {
            alert("Chyba při připojování: " + error.message);
            setJoining(false);
        } else {
            router.push("/dashboard");
        }
    }, [houseId, router, supabase]);

    const handleLogoutAndJoin = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-violet-500 rounded-full animate-spin" /></div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-md p-8 text-center">
                <h1 className="text-2xl font-bold text-accent mb-4">Ups!</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Button onClick={() => router.push("/")} className="w-full">Zpět domů</Button>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />

            <Card className="max-w-md w-full p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-violet-400">
                    <Users className="w-8 h-8" />
                </div>

                <h1 className="text-3xl font-bold font-outfit mb-2">Připojit se k rodině</h1>
                <p className="text-violet-400 font-bold text-xl mb-8 tracking-tight">{house?.name}</p>

                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                    {invitedRole
                        ? `Byli jste pozváni jako ${invitedRole === 'child' ? 'Dítě' : 'Rodič'}. Chcete pokračovat?`
                        : "Byli jste pozváni do rodinného prostoru. Vyberte si svou roli pro pokračování:"}
                </p>

                {currentUser && (
                    <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm text-center">
                        <p className="mb-2">Jste přihlášeni jako <strong>{currentUser.email}</strong>.</p>
                        <p className="mb-4 opacity-80 text-xs text-slate-300">Pokud chcete vytvořit nový účet pro dítě na tomto zařízení, musíte se nejprve odhlásit.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-200 h-9"
                            onClick={handleLogoutAndJoin}
                        >
                            Odhlásit se a pokračovat jako někdo jiný
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {(!invitedRole || invitedRole === 'child') && (
                        <Button
                            variant="primary"
                            className="h-20 text-lg justify-start px-6 gap-4"
                            onClick={() => handleJoin('child')}
                            loading={joining}
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold">Jsem Dítě</span>
                                <span className="text-xs opacity-60">Chci plnit úkoly a sbírat body</span>
                            </div>
                        </Button>
                    )}

                    {(!invitedRole || invitedRole === 'parent') && (
                        <Button
                            variant="outline"
                            className="h-20 text-lg justify-start px-6 gap-4 border-white/10"
                            onClick={() => handleJoin('parent')}
                            loading={joining}
                        >
                            <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold">Jsem Rodič / Admin</span>
                                <span className="text-xs opacity-60">Chci zadávat úkoly a odměňovat</span>
                            </div>
                        </Button>
                    )}
                </div>

                <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Roli může později změnit pouze zakladatel domu.
                </p>
            </Card>
        </div>
    );
}

