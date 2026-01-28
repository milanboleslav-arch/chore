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
    UserPlus,
    Camera,
    Calendar,
    Image as ImageIcon,
    Trash2
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
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'done' | 'failed'>('all');
    const [filterChildId, setFilterChildId] = useState<string>('all');

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

    const loadMembers = async (houseId: string) => {
        const { data } = await supabase
            .from("profiles")
            .select("id, full_name, role")
            .eq("house_id", houseId);
        setMembers(data || []);
    };

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError || !profileData) {
                console.error("Detailní chyba profilu:", JSON.stringify(profileError));
                setError(`Profil nebyl nalezen. (Detaily: ${JSON.stringify(profileError)}). Zkontrolujte prosím e-mail.`);
                setLoading(false);
                return;
            }

            if (profileData.house_id) {
                const { data: houseData } = await supabase
                    .from("houses")
                    .select("name")
                    .eq("id", profileData.house_id)
                    .single();

                setProfile({ ...profileData, houses: houseData });
                await loadTasks(profileData.house_id);
                if (profileData.role === 'parent') {
                    await loadMembers(profileData.house_id);
                }
            } else {
                router.push("/house/setup");
                return;
            }

            setLoading(false);
        }
        loadData();
    }, [supabase, router]);

    const [uploading, setUploading] = useState<string | null>(null);

    const handleUploadProof = async (taskId: string, file: File) => {
        setUploading(taskId);
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('proofs')
            .upload(filePath, file);

        if (uploadError) {
            alert("Chyba nahrávání: " + uploadError.message);
            setUploading(null);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('proofs')
            .getPublicUrl(filePath);

        setUploading(null);
        return publicUrl;
    };

    const handleCompleteTask = async (taskId: string, file?: File) => {
        if (file) {
            const confirmFinish = window.confirm("Máš vše hotovo? Fotka se odešle rodičům ke schválení.");
            if (!confirmFinish) return;
        } else {
            const confirmFinish = window.confirm("Opravdu máš hotovo?");
            if (!confirmFinish) return;
        }

        let proofUrl = null;
        if (file) {
            proofUrl = await handleUploadProof(taskId, file);
            if (!proofUrl) return;
        }

        const { error } = await supabase
            .from("tasks")
            .update({
                status: 'pending_approval',
                proof_url: proofUrl,
                rejection_reason: null,
                assigned_to: profile?.id // Automaticky přiřadit dítěti, které úkol odeslalo
            })
            .eq("id", taskId);

        if (error) {
            console.error("Chyba při dokončování úkolu:", error);
            alert("Chyba: " + error.message + " (Pravděpodobně chybí RLS pravidla v DB)");
        } else {
            if (profile?.house_id) await loadTasks(profile.house_id);
        }
    };

    const handleReturnTask = async (taskId: string) => {
        const reason = window.prompt("Proč úkol vracíš k přepracování?");
        if (reason === null) return; // Cancelled

        const { error } = await supabase
            .from("tasks")
            .update({
                status: 'todo',
                rejection_reason: reason
            })
            .eq("id", taskId);

        if (error) alert(error.message);
        if (profile?.house_id) await loadTasks(profile.house_id);
    };

    const handleExtendDeadline = async (taskId: string) => {
        const newDate = window.prompt("Zadejte nový termín (např. 2024-02-01 18:00):");
        if (!newDate) return;

        const { error } = await supabase
            .from("tasks")
            .update({ deadline: new Date(newDate).toISOString() })
            .eq("id", taskId);

        if (error) alert("Neplatný formát data.");
        if (profile?.house_id) await loadTasks(profile.house_id);
    };

    const handleDeleteTask = async (taskId: string) => {
        const confirmDelete = window.confirm("Opravdu chcete tento úkol smazat? Tato akce je nevratná.");
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            alert("Chyba při mazání: " + error.message);
        } else {
            if (profile?.house_id) await loadTasks(profile.house_id);
        }
    };

    const handleApproveTask = async (task: any) => {
        const { error: taskError } = await supabase
            .from("tasks")
            .update({ status: 'done' })
            .eq("id", task.id);

        if (taskError) return alert(taskError.message);

        if (task.assigned_to) {
            const { data: targetProfile } = await supabase
                .from("profiles")
                .select("points")
                .eq("id", task.assigned_to)
                .single();

            await supabase
                .from("profiles")
                .update({ points: (targetProfile?.points || 0) + task.reward_points })
                .eq("id", task.assigned_to);
        }

        if (profile?.house_id) await loadTasks(profile.house_id);
    };

    const addToCalendar = (task: any) => {
        const title = encodeURIComponent(task.title);
        const details = encodeURIComponent(task.description || "");
        const start = task.deadline ? new Date(task.deadline).toISOString().replace(/-|:|\.\d+/g, "") : "";
        const end = task.deadline ? new Date(new Date(task.deadline).getTime() + 3600000).toISOString().replace(/-|:|\.\d+/g, "") : "";

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
        window.open(url, '_blank');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const filteredTasks = tasks.filter(task => {
        // 1. Status Filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'active' && !(task.status === 'todo' || task.status === 'pending_approval')) return false;
            if (filterStatus === 'done' && task.status !== 'done') return false;
            if (filterStatus === 'failed' && task.status !== 'failed') return false;
        }

        // 2. Child Filter (for parents)
        if (profile?.role === 'parent' && filterChildId !== 'all') {
            if (task.assigned_to !== filterChildId) return false;
        }

        return true;
    });

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
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold leading-none">{profile?.full_name}</span>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider">{profile?.role === 'parent' ? 'Rodič' : 'Dítě'}</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10 mx-1" />
                            <div className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-violet-400" />
                                <span className="text-sm font-black font-outfit text-violet-100">{profile?.points || 0}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-10 h-10 p-0 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all ${filterStatus === 'all' ? 'bg-violet-600/20 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <Gamepad2 className={`w-6 h-6 mb-2 ${filterStatus === 'all' ? 'text-violet-400' : 'text-slate-500'}`} />
                        <span className="text-2xl font-black font-outfit">{tasks.length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Vše</span>
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all ${filterStatus === 'active' ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <Clock className={`w-6 h-6 mb-2 ${filterStatus === 'active' ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'todo' || t.status === 'pending_approval').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Aktivní</span>
                    </button>
                    <button
                        onClick={() => setFilterStatus('done')}
                        className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all ${filterStatus === 'done' ? 'bg-success/20 border-success shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <CheckCircle2 className={`w-6 h-6 mb-2 ${filterStatus === 'done' ? 'text-success' : 'text-slate-500'}`} />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'done').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Splněno</span>
                    </button>
                    <button
                        onClick={() => setFilterStatus('failed')}
                        className={`p-4 flex flex-col items-center justify-center rounded-2xl border transition-all ${filterStatus === 'failed' ? 'bg-accent/20 border-accent shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <AlertCircle className={`w-6 h-6 mb-2 ${filterStatus === 'failed' ? 'text-accent' : 'text-slate-500'}`} />
                        <span className="text-2xl font-black font-outfit">{tasks.filter(t => t.status === 'failed').length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Selhalo</span>
                    </button>
                </div>

                {/* Child Filter (Parents only) */}
                {profile?.role === 'parent' && members.length > 0 && (
                    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setFilterChildId('all')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${filterChildId === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                        >
                            Všichni
                        </button>
                        {members.filter(m => m.role === 'child').map(child => (
                            <button
                                key={child.id}
                                onClick={() => setFilterChildId(child.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${filterChildId === child.id ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                            >
                                {child.full_name}
                            </button>
                        ))}
                    </div>
                )}

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
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <Card key={task.id} className="group overflow-hidden border-white/5 hover:border-violet-500/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold group-hover:text-violet-400 transition-colors leading-tight">{task.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.profiles && (
                                                    <div className="flex items-center gap-1 text-[9px] uppercase font-black text-cyan-500">
                                                        <Users className="w-2.5 h-2.5" />
                                                        <span>{task.profiles.full_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                                            +{task.reward_points} XP
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-xs mb-4 line-clamp-2">{task.description || "Bez popisu."}</p>

                                    {task.proof_url && (
                                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 h-32 relative group/photo shrink-0">
                                            <img src={task.proof_url} alt="Důkaz splnění" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-white text-sm" />
                                            </div>
                                        </div>
                                    )}

                                    {task.punishment_desc && (
                                        <div className="mb-4 p-2.5 rounded-lg bg-accent/5 border border-accent/10 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-accent/80 font-medium leading-tight">
                                                <span className="uppercase font-bold block mb-0.5">Postih:</span>
                                                {task.punishment_desc}
                                            </p>
                                        </div>
                                    )}

                                    {task.rejection_reason && task.status === 'todo' && (
                                        <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <AlertCircle className="w-3 h-3 text-red-500" />
                                                <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Opravit:</p>
                                            </div>
                                            <p className="text-xs text-red-200 italic leading-snug">{task.rejection_reason}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mb-4 mt-auto">
                                        <div className="flex items-center gap-1.5 bg-white/5 py-1 px-2 rounded-md">
                                            <Clock className="w-3 h-3 text-violet-400" />
                                            <span className="font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Bez limitu'}</span>
                                        </div>

                                        <button
                                            onClick={() => addToCalendar(task)}
                                            className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 py-1 px-2 rounded-md hover:bg-white/10"
                                        >
                                            <Calendar className="w-3 h-3 text-cyan-400" />
                                            <span>Přidat do kalendáře</span>
                                        </button>

                                        {task.status === 'pending_approval' && (
                                            <div className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                                Čeká na schválení
                                            </div>
                                        )}
                                        {task.status === 'done' && (
                                            <div className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                Splněno
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {task.status === 'todo' && (
                                            <div className="flex-1 flex gap-2">
                                                {task.requires_proof ? (
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="environment"
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleCompleteTask(task.id, file);
                                                            }}
                                                        />
                                                        <Button
                                                            variant="secondary"
                                                            className="w-full py-2 text-sm rounded-lg shadow-lg gap-2"
                                                            loading={uploading === task.id}
                                                        >
                                                            <Camera className="w-4 h-4" /> Vyfotit a splnit
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        className="flex-1 py-2 text-sm rounded-lg shadow-lg"
                                                        onClick={() => handleCompleteTask(task.id)}
                                                    >
                                                        Splnit Quest
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {task.status === 'pending_approval' && profile?.role === 'parent' && (
                                            <div className="flex-1 flex gap-2">
                                                <Button
                                                    variant="primary"
                                                    className="flex-1 py-2 text-sm rounded-lg shadow-lg bg-green-600 hover:bg-green-500"
                                                    onClick={() => handleApproveTask(task)}
                                                >
                                                    Schválit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 py-2 text-sm rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    onClick={() => handleReturnTask(task.id)}
                                                >
                                                    Vrátit
                                                </Button>
                                            </div>
                                        )}

                                        {task.status === 'pending_approval' && profile?.role === 'child' && (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="flex-1 py-2 text-sm rounded-lg opacity-50 border-amber-500/30 text-amber-400"
                                            >
                                                Odesláno rodiči
                                            </Button>
                                        )}

                                        {task.status === 'done' && (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="flex-1 py-2 text-sm rounded-lg opacity-50 border-green-500/30 text-green-400"
                                            >
                                                Hotovo!
                                            </Button>
                                        )}

                                        {profile?.role === 'parent' && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-lg hover:bg-white/10"
                                                    onClick={() => handleExtendDeadline(task.id)}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-lg hover:bg-red-500/10 text-red-500"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
