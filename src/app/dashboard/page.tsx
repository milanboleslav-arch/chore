"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    Gamepad2,
    Plus,
    Settings,
    LogOut,
    Trophy,
    Clock,
    CheckCircle2,
    AlertCircle,
    Users,
    UserPlus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { InviteModal } from "@/components/InviteModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const loadTasks = async (houseId: string) => {
        const { data: tasks } = await supabase
            .from("tasks")
            .select("*, profiles!tasks_assigned_to_fkey(full_name)")
            .eq("house_id", houseId)
            .order("deadline", { ascending: true });
        setTasks(tasks || []);
    };

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch profile without joining houses first to avoid RLS issues if house doesn't exist
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError || !profileData) {
                console.error("Profil stále neexistuje v databázi nebo RLS blokuje přístup.", profileError);
                setError("Váš profil nebyl nalezen. Zkuste se prosím odhlásit a znovu přihlásit.");
                setLoading(false);
                return;
            }

            // Now we have the profile, let's try to get the house name if it exists
            if (profileData.house_id) {
                const { data: houseData } = await supabase
                    .from("houses")
                    .select("name")
                    .eq("id", profileData.house_id)
                    .single();

                setProfile({ ...profileData, houses: houseData });
                await loadTasks(profileData.house_id);
            } else {
                // NO HOUSE ASSIGNED -> GO TO SETUP
                console.log("Uživatel nemá dům, přesměrovávám na setup...");
                router.push("/house/setup");
                return;
            }

            setLoading(false);
        }
        loadData();
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md p-8 text-center border-red-500/30">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Chyba systému</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
                        Zkusit znovu
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full mt-2">
                        Odhlásit se
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                houseId={profile?.house_id}
                houseName={profile?.houses?.name}
            />
            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                houseId={profile?.house_id}
                onTaskCreated={() => loadTasks(profile?.house_id)}
            />

            {/* Header */}
            <header className="border-b border-white/5 bg-white/[0.02] sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Gamepad2 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold font-outfit uppercase tracking-tight leading-none text-xl">Chore</h1>
                            <p className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">{profile?.houses?.name || "Rodina"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {profile?.role === 'parent' && (
                            <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(true)} className="hidden md:flex border-violet-500/20 hover:bg-violet-500/10 text-violet-400">
                                <UserPlus className="w-4 h-4 mr-2" /> Pozvat
                            </Button>
                        )}
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold">{profile?.full_name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{profile?.role === 'parent' ? 'Rodič' : 'Dítě'}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-10 h-10 p-0 rounded-full">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-8">
                {/* Mobile Invite Button */}
                {profile?.role === 'parent' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInviteOpen(true)}
                        className="w-full mb-6 md:hidden border-violet-500/20 text-violet-400"
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Pozvat nového člena
                    </Button>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Card className="p-4 flex flex-col items-center justify-center bg-violet-600/5 border-violet-500/20">
                        <Trophy className="w-6 h-6 text-violet-400 mb-2" />
                        <span className="text-2xl font-black font-outfit">{profile?.points || 0}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Moje XP</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center bg-cyan-600/5 border-cyan-500/20">
                        <Clock className="w-6 h-6 text-cyan-400 mb-2" />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'todo').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Aktivní</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center bg-success/5 border-success/20">
                        <CheckCircle2 className="w-6 h-6 text-success mb-2" />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'done').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Splněno</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center bg-accent/5 border-accent/20">
                        <AlertCircle className="w-6 h-6 text-accent mb-2" />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'failed').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Selhalo</span>
                    </Card>
                </div>

                {/* Action Header */}
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-400">Dostupné Questy</h2>
                    {profile?.role === 'parent' && (
                        <Button size="sm" onClick={() => setIsCreateTaskOpen(true)} className="rounded-full px-6">
                            <Plus className="w-4 h-4 mr-1" /> Nový Quest
                        </Button>
                    )}
                </div>

                {/* Task List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <Card key={task.id} className="group overflow-hidden border-white/5 hover:border-violet-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold group-hover:text-violet-400 transition-colors">{task.title}</h3>
                                            {task.profiles && (
                                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-500 mt-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>Přiřazeno: {task.profiles.full_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                                            +{task.reward_points} XP
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{task.description || "Bez popisu."}</p>

                                    {task.punishment_desc && (
                                        <div className="mb-6 p-2 rounded-lg bg-accent/5 border border-accent/10 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-accent/80 font-medium leading-tight">
                                                <span className="uppercase font-bold block mb-0.5">Postih:</span>
                                                {task.punishment_desc}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Bez termínu'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 py-2 text-sm rounded-lg shadow-lg">
                                            Splnit Quest
                                        </Button>
                                        {profile?.role === 'parent' && (
                                            <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg hover:bg-white/10">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                                    <Gamepad2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold font-outfit text-slate-500 mb-2">Zatím žádné dobrodružství</h3>
                                <p className="text-slate-600 max-w-xs mx-auto">Vytvořte první úkol a začněte sbírat body.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
