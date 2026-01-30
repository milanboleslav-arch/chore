"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { X, Copy, Check, QrCode as QrIcon, User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    houseId: string;
    houseName: string;
}

export const InviteModal = ({ isOpen, onClose, houseId, houseName }: InviteModalProps) => {
    const [copied, setCopied] = useState(false);
    const [role, setRole] = useState<'child' | 'parent'>('child');

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${baseUrl}/join/${houseId}?role=${role}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm"
                    >
                        <Card className="p-8 border-violet-500/30 overflow-hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="absolute right-4 top-4 w-8 h-8 p-0 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-violet-400">
                                    <QrIcon className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold font-outfit">Pozvat člena</h2>
                                <p className="text-sm text-slate-400 mt-1">{houseName}</p>
                                {typeof window !== "undefined" && window.location.hostname === "localhost" && (
                                    <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-200 leading-tight">
                                        <strong>Pozor:</strong> Jste na <code>localhost</code>. QR kód nemusí v telefonu fungovat. Pro testování na mobilu použijte IP adresu vašeho počítače.
                                    </div>
                                )}
                            </div>

                            {/* Role Selector */}
                            <div className="flex p-1 bg-white/5 rounded-xl mb-8">
                                <button
                                    onClick={() => setRole('child')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'child' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <User className="w-3 h-3" /> Dítě
                                </button>
                                <button
                                    onClick={() => setRole('parent')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'parent' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Shield className="w-3 h-3" /> Rodič
                                </button>
                            </div>

                            <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-8 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                <QRCodeSVG value={inviteUrl} size={180} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={inviteUrl}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-slate-400 outline-none truncate"
                                    />
                                    <Button
                                        variant="outline"
                                        className="h-10 w-10 p-0 shrink-0"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-slate-500 mt-6 leading-relaxed">
                                Tento kód pozve uživatele s rolí <span className="text-violet-400 font-bold uppercase">{role === 'child' ? 'Dítě' : 'Rodič'}</span>.
                                <br />
                                <span className="opacity-60 italic mt-1 block">Pokud kód skenujete na stejném zařízení, je nutné se nejprve odhlásit.</span>
                            </p>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
