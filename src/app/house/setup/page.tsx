"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, Home, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function HouseSetupPage() {
    const [houseName, setHouseName] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function checkPendingInvite() {
            const searchParams = new URLSearchParams(window.location.search);
            const queryHouseId = searchParams.get("house_id");
            const queryRole = searchParams.get("role");

            const houseId = queryHouseId || localStorage.getItem("pending_house_id");
            const role = queryRole || localStorage.getItem("pending_role") || "child";

            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    router.push("/login");
                    return;
                }

                if (houseId) {
                    const { error } = await supabase
                        .from("profiles")
                        .update({ house_id: houseId, role: role })
                        .eq("id", user.id);

                    if (!error) {
                        localStorage.removeItem("pending_house_id");
                        localStorage.removeItem("pending_role");
                        router.push("/dashboard");
                        return;
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Auth error:", err);
                router.push("/login");
            }
        }
        checkPendingInvite();
    }, [supabase, router]);

    const handleCreateHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Pro vytvoření rodiny musíte být přihlášeni. Zkontrolujte prosím svůj email pro potvrzení registrace.");
            setLoading(false);
            router.push("/login");
            return;
        }

        // 1. Create the house
        const { data: house, error: houseError } = await supabase
            .from("houses")
            .insert({ name: houseName, owner_id: user.id })
            .select()
            .single();

        if (houseError) {
            alert("Chyba při vytváření domu: " + houseError.message);
            setLoading(false);
            return;
        }

        // 2. Update user profile with house_id and role
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ house_id: house.id, role: "parent" })
            .eq("id", user.id);

        if (profileError) {
            alert("Chyba při propojování s profílem: " + profileError.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-violet-400">
                        <Home className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold font-outfit mb-2">Vítejte v Chore!</h1>
                    <p className="text-slate-400">Pojďme pojmenovat váš rodinný prostor</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleCreateHouse} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Název Domu / Rodiny</label>
                            <div className="relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="např. U Nováků, Hrdinové z 5. patra"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500 transition-colors"
                                    value={houseName}
                                    onChange={(e) => setHouseName(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-14" loading={loading}>
                            Vytvořit a pokračovat <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
