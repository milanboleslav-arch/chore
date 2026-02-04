"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { X, Trophy, AlertCircle, Clock, Camera, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    houseId: string;
    onTaskCreated: () => void;
}

export const CreateTaskModal = ({ isOpen, onClose, houseId, onTaskCreated }: CreateTaskModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [reward, setReward] = useState("10");
    const [punishment, setPunishment] = useState("");
    const [deadline, setDeadline] = useState("");
    const [requiresProof, setRequiresProof] = useState(false);
    const [notifyAllParents, setNotifyAllParents] = useState(false);
    const [assignedTo, setAssignedTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);

    const supabase = createClient();

    useEffect(() => {
        if (isOpen && houseId) {
            const fetchMembers = async () => {
                const { data } = await supabase
                    .from("profiles")
                    .select("id, full_name, role")
                    .eq("house_id", houseId);
                setMembers(data || []);
            };
            fetchMembers();
        }
    }, [isOpen, houseId, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("tasks").insert({
            house_id: houseId,
            title,
            description,
            reward_points: parseInt(reward),
            punishment_desc: punishment,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            requires_proof: requiresProof,
            notify_all_parents: notifyAllParents,
            assigned_to: assignedTo || null,
            created_by: user.id,
            status: "todo"
        });

        if (error) {
            alert("Chyba při vytváření úkolu: " + error.message);
        } else {
            onTaskCreated();
            onClose();
            // Reset form
            setTitle("");
            setDescription("");
            setReward("10");
            setPunishment("");
            setDeadline("");
            setRequiresProof(false);
            setNotifyAllParents(false);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg my-auto"
                    >
                        <Card className="p-8 border-violet-500/30">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="absolute right-4 top-4 w-8 h-8 p-0 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <h2 className="text-2xl font-bold font-outfit mb-6">Nový Úkol</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Název úkolu</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="např. Uklidit myčku"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Popis (volitelně)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Co přesně je potřeba udělat..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors h-24 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                                            <Trophy className="w-3 h-3 text-success" /> Odměna (Body)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={reward}
                                            onChange={(e) => setReward(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-violet-400" /> Termín
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 text-accent" /> Trest / Postih
                                    </label>
                                    <input
                                        value={punishment}
                                        onChange={(e) => setPunishment(e.target.value)}
                                        placeholder="např. Bez tabletu na večer"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                                        <User className="w-3 h-3 text-cyan-400" /> Přiřadit k
                                    </label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 transition-colors appearance-none"
                                    >
                                        <option value="" className="bg-[#0f111a]">Kdokoliv (veřejný úkol)</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.id} className="bg-[#0f111a]">
                                                {member.full_name} ({member.role === 'child' ? 'Dítě' : 'Rodič'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                        <div
                                            onClick={() => setRequiresProof(!requiresProof)}
                                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${requiresProof ? 'bg-cyan-500 border-cyan-500' : 'border-white/10 bg-white/5 group-hover:border-cyan-500/50'}`}
                                        >
                                            {requiresProof && <Camera className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vyžadovat fotku</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                        <div
                                            onClick={() => setNotifyAllParents(!notifyAllParents)}
                                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${notifyAllParents ? 'bg-violet-600 border-violet-600' : 'border-white/10 bg-white/5 group-hover:border-violet-600/50'}`}
                                        >
                                            {notifyAllParents && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upozornit všechny rodiče</span>
                                    </label>
                                </div>

                                <Button type="submit" className="w-full h-14 text-lg" loading={loading}>
                                    Vytvořit Úkol
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
